import {
  addDoc,
  getDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import { normalizeDifficulty } from '../utils/difficultyNormalizer'

const defaultUser = (user) => ({
  uid: user.uid,
  displayName: user.displayName || 'Anonymous',
  email: user.email,
  photoURL: user.photoURL || '',
  createdAt: serverTimestamp(),
  stats: {
    totalSolved: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSolvedDate: null,
    weakTopics: [],
    strongTopics: [],
  },
  preferences: {
    revisionIntervalDays: 3,
    dailyGoal: 5,
    platforms: ['leetcode', 'codeforces'],
  },
})

export async function ensureUserDocument(user) {
  await setDoc(doc(db, 'users', user.uid), defaultUser(user), { merge: true })
}

export async function updateUserProfileDB(userId, payload) {
  await updateDoc(doc(db, 'users', userId), {
    ...payload,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeToUserDoc(userId, callback) {
  return onSnapshot(doc(db, 'users', userId), (snap) => {
    callback(snap.exists() ? snap.data() : null)
  })
}

export async function saveStudyPlan(userId, planData) {
  await updateDoc(doc(db, 'users', userId), {
    studyPlan: planData,
    updatedAt: serverTimestamp(),
  })
}

export async function addQuestionForUser(userId, payload) {
  const solvedAt = payload.solvedAt || new Date().toISOString()
  const timeTakenMins = Number(payload.timeTakenMins || 30)
  const intervalDays = 3
  const nextRevisionDate = new Date(solvedAt)
  nextRevisionDate.setDate(nextRevisionDate.getDate() + intervalDays)

  const question = {
    title: payload.title,
    url: payload.url,
    platform: payload.platform,
    topic: payload.topic,
    difficulty: normalizeDifficulty(payload.platform, payload.difficulty),
    solveHistory: [
      {
        solvedAt,
        timeTakenMins,
        felt: payload.felt || 'okay',
        notes: payload.notes || '',
      },
    ],
    revision: {
      nextRevisionDate: nextRevisionDate.toISOString(),
      intervalDays,
      totalAttempts: 1,
      averageTimeMins: timeTakenMins,
      masteryScore: 50,
    },
    addedVia: 'manual',
    createdAt: serverTimestamp(),
  }
  const questionRef = await addDoc(collection(db, 'users', userId, 'questions'), question)
  await addDoc(collection(db, 'users', userId, 'revisionQueue'), {
    questionId: questionRef.id,
    questionTitle: question.title,
    scheduledFor: nextRevisionDate.toISOString(),
    status: 'pending',
    reason: 'Newly solved question needs reinforcement in 3 days.',
    createdAt: serverTimestamp(),
  })
}

export function subscribeToQuestions(userId, callback) {
  const q = query(collection(db, 'users', userId, 'questions'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export function subscribeToRevisionQueue(userId, callback) {
  const q = query(
    collection(db, 'users', userId, 'revisionQueue'),
    where('status', 'in', ['pending', 'snoozed']),
    orderBy('scheduledFor', 'asc'),
  )
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
}

export async function updateQuestionRevision(userId, questionId, outcome) {
  const questionRef = doc(db, 'users', userId, 'questions', questionId)
  const snap = await getDoc(questionRef)
  const question = snap.exists() ? snap.data() : null
  const nextHistory = [
    ...(question?.solveHistory || []),
    {
      solvedAt: new Date().toISOString(),
      timeTakenMins: outcome.latestTimeTakenMins || outcome.averageTimeMins || 0,
      felt: outcome.feelingAfterRevision || 'okay',
      notes: outcome.notes || '',
    },
  ]

  await updateDoc(doc(db, 'users', userId, 'questions', questionId), {
    revision: {
      intervalDays: outcome.newInterval,
      masteryScore: outcome.masteryScore,
      nextRevisionDate: outcome.nextRevisionDate,
      totalAttempts: outcome.totalAttempts,
      averageTimeMins: outcome.averageTimeMins,
    },
    solveHistory: nextHistory,
    updatedAt: serverTimestamp(),
  })

  const queueSnapshot = await getDocs(
    query(
      collection(db, 'users', userId, 'revisionQueue'),
      where('questionId', '==', questionId),
      where('status', 'in', ['pending', 'snoozed']),
      limit(1),
    ),
  )

  if (!queueSnapshot.empty) {
    const queueDoc = queueSnapshot.docs[0]
    await updateDoc(doc(db, 'users', userId, 'revisionQueue', queueDoc.id), {
      status: 'done',
      completedAt: serverTimestamp(),
    })
  }

  await addDoc(collection(db, 'users', userId, 'revisionQueue'), {
    questionId,
    questionTitle: question?.title || 'Question',
    scheduledFor: outcome.nextRevisionDate,
    status: 'pending',
    reason:
      outcome.feelingAfterRevision === 'hard'
        ? 'Performance dipped, so this question was brought back quickly.'
        : 'Spaced repetition scheduled this for long-term retention.',
    createdAt: serverTimestamp(),
  })
}

export async function snoozeRevisionQueueItem(userId, queueId) {
  const queueRef = doc(db, 'users', userId, 'revisionQueue', queueId)
  const snap = await getDoc(queueRef)
  if (!snap.exists()) return

  const scheduled = snap.data().scheduledFor ? new Date(snap.data().scheduledFor) : new Date()
  scheduled.setDate(scheduled.getDate() + 1)

  await updateDoc(queueRef, {
    status: 'snoozed',
    scheduledFor: scheduled.toISOString(),
    reason: 'Snoozed for 1 day by user.',
  })
}

export async function createGroup(user, payload) {
  await addDoc(collection(db, 'groups'), {
    ...payload,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    members: [{
      userId: user.uid,
      displayName: user.displayName || user.email,
      photoURL: user.photoURL || '',
      role: 'admin',
      joinedAt: new Date().toISOString(),
      weeklyStats: {
        questionsSolved: 0,
        revisionsCompleted: 0,
        currentStreak: 0,
        challengesWon: 0,
        score: 0,
      },
    }],
  })
}

export async function joinGroupWithInviteCode(user, inviteCode) {
  const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Invalid invite code')
  const target = snap.docs[0]
  const data = target.data()
  const members = data.members || []
  if (members.some((m) => m.userId === user.uid)) return
  members.push({
    userId: user.uid,
    displayName: user.displayName || user.email,
    photoURL: user.photoURL || '',
    role: 'member',
    joinedAt: new Date().toISOString(),
    weeklyStats: {
      questionsSolved: 0,
      revisionsCompleted: 0,
      currentStreak: 0,
      challengesWon: 0,
      score: 0,
    },
  })
  await updateDoc(doc(db, 'groups', target.id), { members })
}

export function subscribeToGroups(userId, callback) {
  const q = query(collection(db, 'groups'))
  return onSnapshot(q, (snap) => {
    const groups = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((group) => (group.members || []).some((member) => member.userId === userId))
    callback(groups)
  })
}

export function subscribeToChallenges(userId, callback) {
  const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const challenges = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((challenge) => challenge.challenger?.userId === userId || challenge.challenged?.userId === userId)
    callback(challenges)
  })
}

export async function createChallenge(payload) {
  await addDoc(collection(db, 'challenges'), {
    ...payload,
    status: 'pending',
    winner: null,
    createdAt: serverTimestamp(),
    startedAt: new Date().toISOString()
  })
}

export async function deleteChallenge(challengeId) {
  await deleteDoc(doc(db, 'challenges', challengeId))
}

export async function submitChallengeSolution(challengeId, userId, code, outcome) {
  const challengeRef = doc(db, 'challenges', challengeId)
  const snap = await getDoc(challengeRef)
  if (!snap.exists()) return

  const challenge = snap.data()
  let updates = {}
  let isChallenger = challenge.challenger?.userId === userId

  const userRoleStr = isChallenger ? 'challenger' : 'challenged'
  
  const updatedUserObj = {
    ...challenge[userRoleStr],
    status: 'completed',
    timeTakenMins: outcome.timeTakenMins,
    submittedCode: code
  }

  updates[userRoleStr] = updatedUserObj

  const otherRoleStr = isChallenger ? 'challenged' : 'challenger'
  const otherUserObj = challenge[otherRoleStr]

  if (otherUserObj?.status === 'completed') {
    updates.status = 'completed'
    if (updatedUserObj.timeTakenMins < otherUserObj.timeTakenMins) {
      updates.winner = updatedUserObj.userId
    } else if (updatedUserObj.timeTakenMins > otherUserObj.timeTakenMins) {
      updates.winner = otherUserObj.userId
    } else {
      updates.winner = 'draw'
    }
  }

  await updateDoc(challengeRef, updates)
}

export async function deleteGroup(groupId) {
  await deleteDoc(doc(db, 'groups', groupId))
}
