/**
 * GrindSync — Full Demo Seed Script
 * Targets: demo@grindsync.com / Demo@123
 *
 * Seeds:
 *  - 30 questions (solveHistory spread across last 30 days for heatmap)
 *  - 5 pending/snoozed revisions due today
 *  - 1 group "SDE 2026 Prep" with 4 members + varied weeklyStats (leaderboard)
 *  - 3 completed challenges (2 wins, 1 loss for demo user)
 *  - AI mentor chat history stored in user doc
 *  - User doc with rich stats snapshot
 */

import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

// ── Load .env ──────────────────────────────────────────────────────────────────
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim().replace(/['"]/g, '');
    env[key] = val;
  }
});

const firebaseConfig = {
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ── Helpers ────────────────────────────────────────────────────────────────────
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Wipe existing demo data so re-runs are idempotent ─────────────────────────
async function clearExistingData(uid) {
  console.log('  Clearing old questions...');
  const qSnap = await getDocs(collection(db, 'users', uid, 'questions'));
  await Promise.all(qSnap.docs.map(d => deleteDoc(d.ref)));

  console.log('  Clearing old revisionQueue...');
  const rSnap = await getDocs(collection(db, 'users', uid, 'revisionQueue'));
  await Promise.all(rSnap.docs.map(d => deleteDoc(d.ref)));

  console.log('  Clearing demo group(s)...');
  const gSnap = await getDocs(
    query(collection(db, 'groups'), where('createdBy', '==', uid))
  );
  await Promise.all(gSnap.docs.map(d => deleteDoc(d.ref)));

  console.log('  Clearing demo challenges...');
  const cSnap = await getDocs(collection(db, 'challenges'));
  const demoChallenges = cSnap.docs.filter(d => {
    const data = d.data();
    return data.challenger?.userId === uid || data.challenged?.userId === uid;
  });
  await Promise.all(demoChallenges.map(d => deleteDoc(d.ref)));
}

// ── Question bank ─────────────────────────────────────────────────────────────
const QUESTION_BANK = [
  // Arrays — mastery target 80
  { title: 'Two Sum',                    topic: 'Arrays',      difficulty: 'beginner',    platform: 'leetcode', url: 'https://leetcode.com/problems/two-sum/', mastery: 85 },
  { title: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'beginner',   platform: 'leetcode', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', mastery: 90 },
  { title: 'Contains Duplicate',         topic: 'Arrays',      difficulty: 'beginner',    platform: 'leetcode', url: 'https://leetcode.com/problems/contains-duplicate/', mastery: 80 },
  { title: 'Product of Array Except Self', topic: 'Arrays',    difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/product-of-array-except-self/', mastery: 75 },
  { title: 'Maximum Subarray',           topic: 'Arrays',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/maximum-subarray/', mastery: 82 },
  { title: '3Sum',                       topic: 'Arrays',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/3sum/', mastery: 78 },
  { title: 'Merge Intervals',            topic: 'Arrays',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/merge-intervals/', mastery: 80 },
  { title: 'Rotate Array',              topic: 'Arrays',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/rotate-array/', mastery: 77 },

  // DP — mastery target 45
  { title: 'Climbing Stairs',            topic: 'DP',          difficulty: 'beginner',    platform: 'leetcode', url: 'https://leetcode.com/problems/climbing-stairs/', mastery: 55 },
  { title: 'House Robber',               topic: 'DP',          difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/house-robber/', mastery: 48 },
  { title: 'Coin Change',                topic: 'DP',          difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/coin-change/', mastery: 40 },
  { title: 'Longest Common Subsequence', topic: 'DP',          difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/longest-common-subsequence/', mastery: 35 },
  { title: 'Longest Increasing Subsequence', topic: 'DP',     difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/longest-increasing-subsequence/', mastery: 42 },
  { title: 'Edit Distance',              topic: 'DP',          difficulty: 'advanced',    platform: 'leetcode', url: 'https://leetcode.com/problems/edit-distance/', mastery: 30 },
  { title: 'Partition Equal Subset Sum', topic: 'DP',          difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/partition-equal-subset-sum/', mastery: 45 },

  // Graphs — mastery target 60
  { title: 'Number of Islands',          topic: 'Graphs',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/number-of-islands/', mastery: 70 },
  { title: 'Clone Graph',                topic: 'Graphs',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/clone-graph/', mastery: 60 },
  { title: 'Course Schedule',            topic: 'Graphs',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/course-schedule/', mastery: 55 },
  { title: 'Pacific Atlantic Water Flow', topic: 'Graphs',     difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', mastery: 50 },
  { title: 'Surrounded Regions',         topic: 'Graphs',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/surrounded-regions/', mastery: 60 },
  { title: 'Rotting Oranges',            topic: 'Graphs',      difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/rotting-oranges/', mastery: 65 },

  // Trees — mastery target ~75
  { title: 'Maximum Depth of Binary Tree', topic: 'Trees',    difficulty: 'beginner',    platform: 'leetcode', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', mastery: 85 },
  { title: 'Invert Binary Tree',          topic: 'Trees',     difficulty: 'beginner',    platform: 'leetcode', url: 'https://leetcode.com/problems/invert-binary-tree/', mastery: 80 },
  { title: 'Binary Tree Level Order Traversal', topic: 'Trees', difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', mastery: 75 },
  { title: 'Validate Binary Search Tree', topic: 'Trees',     difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/validate-binary-search-tree/', mastery: 70 },

  // Sliding Window
  { title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', mastery: 72 },
  { title: 'Minimum Window Substring',   topic: 'Sliding Window', difficulty: 'advanced', platform: 'leetcode', url: 'https://leetcode.com/problems/minimum-window-substring/', mastery: 58 },

  // Backtracking
  { title: 'Combination Sum',            topic: 'Backtracking', difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/combination-sum/', mastery: 65 },
  { title: 'Subsets',                    topic: 'Backtracking', difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/subsets/', mastery: 70 },

  // Binary Search
  { title: 'Search in Rotated Sorted Array', topic: 'Binary Search', difficulty: 'intermediate', platform: 'leetcode', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', mastery: 68 },
];

// ── Assign realistic solve dates spread across last 30 days ───────────────────
// Heavier activity in last 7 days to show heatmap density
function assignSolveDate(index) {
  // Questions 0-9: solved in last 7 days
  if (index < 10) return daysAgo(rand(0, 6));
  // Questions 10-19: 7-18 days ago
  if (index < 20) return daysAgo(rand(7, 18));
  // Questions 20-29: 19-30 days ago
  return daysAgo(rand(19, 30));
}

// ── Main seed function ─────────────────────────────────────────────────────────
const run = async () => {
  console.log('\n🚀 GrindSync Demo Seed Script Starting...\n');

  // Sign in
  console.log('🔐 Signing in as demo@grindsync.com...');
  const creds = await signInWithEmailAndPassword(auth, 'demo@grindsync.com', 'Demo@123');
  const uid = creds.user.uid;
  console.log(`✅ Signed in! UID: ${uid}\n`);

  // Clear old data
  console.log('🗑  Clearing existing demo data...');
  await clearExistingData(uid);
  console.log('✅ Cleared.\n');

  // ── 1. Seed 30 Questions ───────────────────────────────────────────────────
  console.log('📚 Seeding 30 questions with solve history...');
  const questionIds = [];

  for (let i = 0; i < QUESTION_BANK.length; i++) {
    const q = QUESTION_BANK[i];
    const solveDate = assignSolveDate(i);
    const timeMins = rand(15, 50);

    // Some questions have been revised once
    const hasRevision = i < 15;
    const revisionDate = hasRevision ? daysAgo(rand(1, 7)) : null;
    const totalAttempts = hasRevision ? 2 : 1;
    const avgTime = hasRevision ? Math.round((timeMins + rand(10, 40)) / 2) : timeMins;

    const solveHistory = [
      {
        solvedAt: solveDate.toISOString(),
        timeTakenMins: timeMins,
        felt: pick(['easy', 'okay', 'hard']),
        notes: i < 5 ? 'Reviewed with mentor guidance.' : '',
      },
    ];

    if (hasRevision && revisionDate) {
      const revTimeMins = rand(10, 45);
      solveHistory.push({
        solvedAt: revisionDate.toISOString(),
        timeTakenMins: revTimeMins,
        felt: pick(['easy', 'okay']),
        notes: 'Spaced repetition revision.',
      });
    }

    // Next revision: some overdue (for pending queue), some future
    const nextRevDays = i < 5 ? 0 : rand(1, 14);
    const nextRevDate = i < 5 ? new Date() : daysFromNow(nextRevDays);

    const questionDoc = {
      title: q.title,
      url: q.url,
      platform: q.platform,
      topic: q.topic,
      difficulty: q.difficulty,
      solveHistory,
      revision: {
        nextRevisionDate: nextRevDate.toISOString(),
        intervalDays: hasRevision ? rand(4, 12) : 3,
        totalAttempts,
        averageTimeMins: avgTime,
        masteryScore: q.mastery,
      },
      addedVia: 'manual',
      createdAt: Timestamp.fromDate(solveDate),
    };

    const ref = await addDoc(collection(db, 'users', uid, 'questions'), questionDoc);
    questionIds.push({ id: ref.id, title: q.title });
    process.stdout.write(`  [${i + 1}/30] ${q.title}\n`);
  }
  console.log('✅ 30 questions seeded.\n');

  // ── 2. Seed 5 Pending Revisions Due Today ─────────────────────────────────
  console.log('🔁 Seeding 5 revisions due today...');
  // Set scheduledFor to today at 00:01 — Revision page shows all pending/snoozed
  // items regardless of date (no date filter in the UI), so this guarantees visibility.


  const revisionSeeds = [
    {
      title: 'Coin Change',
      reason: 'You took 2.1x longer than average last time',
      status: 'pending',
      qId: questionIds[10]?.id,
    },
    {
      title: 'Edit Distance',
      reason: 'Not solved in 8 days — memory may be fading',
      status: 'pending',
      qId: questionIds[13]?.id,
    },
    {
      title: 'Longest Common Subsequence',
      reason: 'Weak topic: Dynamic Programming needs reinforcement',
      status: 'pending',
      qId: questionIds[11]?.id,
    },
    {
      title: 'Two Sum',
      reason: 'Initial solve — verify retention after 3 days',
      status: 'pending',
      qId: questionIds[0]?.id,
    },
    {
      title: 'Number of Islands',
      reason: 'Struggled last attempt (marked as Hard)',
      status: 'pending',
      qId: questionIds[15]?.id,
    },
  ];

  for (const rev of revisionSeeds) {
    await addDoc(collection(db, 'users', uid, 'revisionQueue'), {
      questionId: rev.qId || `mock_qid_${Math.random()}`,
      questionTitle: rev.title,
      scheduledFor: new Date().toISOString(),
      status: rev.status,
      reason: rev.reason,
      createdAt: serverTimestamp(),
    });
    console.log(`  ✔ ${rev.title} (${rev.status})`);
  }
  console.log('✅ 5 revisions seeded.\n');

  // ── 3. Seed Group "SDE 2026 Prep" ─────────────────────────────────────────
  console.log('👥 Seeding group "SDE 2026 Prep"...');
  const groupRef = await addDoc(collection(db, 'groups'), {
    name: 'SDE 2026 Prep',
    description: 'Road to FAANG — daily DSA grind, weekly challenges, and accountability.',
    createdBy: uid,
    createdAt: serverTimestamp(),
    inviteCode: 'SDE202',
    members: [
      {
        userId: uid,
        displayName: 'Demo Account',
        photoURL: '',
        role: 'admin',
        joinedAt: daysAgo(21).toISOString(),
        weeklyStats: { questionsSolved: 18, revisionsCompleted: 7, currentStreak: 5, challengesWon: 2, score: 450 },
      },
      {
        userId: 'fake_alice_001',
        displayName: 'Alice Wang',
        photoURL: '',
        role: 'member',
        joinedAt: daysAgo(20).toISOString(),
        weeklyStats: { questionsSolved: 26, revisionsCompleted: 12, currentStreak: 14, challengesWon: 6, score: 830 },
      },
      {
        userId: 'fake_bob_002',
        displayName: 'Bob Smith',
        photoURL: '',
        role: 'member',
        joinedAt: daysAgo(18).toISOString(),
        weeklyStats: { questionsSolved: 11, revisionsCompleted: 3, currentStreak: 2, challengesWon: 0, score: 195 },
      },
      {
        userId: 'fake_charlie_003',
        displayName: 'Charlie Dev',
        photoURL: '',
        role: 'member',
        joinedAt: daysAgo(15).toISOString(),
        weeklyStats: { questionsSolved: 16, revisionsCompleted: 5, currentStreak: 4, challengesWon: 1, score: 370 },
      },
    ],
  });
  console.log(`✅ Group created (id: ${groupRef.id})\n`);

  // ── 4. Seed 3 Completed Challenges ────────────────────────────────────────
  console.log('⚔️  Seeding 3 completed challenges...');

  const challengeData = [
    // Demo wins
    {
      daysBack: 2,
      questionTitle: 'Two Sum',
      questionUrl: 'https://leetcode.com/problems/two-sum/',
      difficulty: 'beginner',
      challengerTime: 11,
      challengedTime: 18,
      winner: uid, // Demo wins
    },
    // Demo loses
    {
      daysBack: 5,
      questionTitle: 'Longest Substring Without Repeating Characters',
      questionUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      difficulty: 'intermediate',
      challengerTime: 28,
      challengedTime: 19,
      winner: 'fake_alice_001', // Alice wins
    },
    // Demo wins
    {
      daysBack: 9,
      questionTitle: 'Number of Islands',
      questionUrl: 'https://leetcode.com/problems/number-of-islands/',
      difficulty: 'intermediate',
      challengerTime: 22,
      challengedTime: 31,
      winner: uid, // Demo wins
    },
  ];

  for (const c of challengeData) {
    const cd = daysAgo(c.daysBack);
    await addDoc(collection(db, 'challenges'), {
      groupId: groupRef.id,
      questionId: c.questionUrl,
      questionTitle: c.questionTitle,
      questionUrl: c.questionUrl,
      difficulty: c.difficulty,
      topic: 'custom',
      status: 'completed',
      winner: c.winner,
      createdAt: Timestamp.fromDate(cd),
      startedAt: cd.toISOString(),
      expiresAt: new Date(cd.getTime() + 60 * 60 * 1000).toISOString(),
      challenger: {
        userId: uid,
        displayName: 'Demo Account',
        status: 'completed',
        timeTakenMins: c.challengerTime,
        submittedCode: '// Solution submitted via GrindSync',
      },
      challenged: {
        userId: 'fake_alice_001',
        displayName: 'Alice Wang',
        status: 'completed',
        timeTakenMins: c.challengedTime,
        submittedCode: '// Alice\'s solution',
      },
    });
    const outcome = c.winner === uid ? '🏆 Demo won' : '❌ Alice won';
    console.log(`  ✔ "${c.questionTitle}" — ${outcome} (${c.challengerTime}m vs ${c.challengedTime}m)`);
  }
  console.log('✅ 3 challenges seeded.\n');

  // ── 5. Update User Document ────────────────────────────────────────────────
  console.log('👤 Updating user document...');
  const mentorChatHistory = [
    // Conversation 1 — Weak topic analysis
    {
      id: 'chat_1',
      role: 'user',
      content: JSON.stringify({ text: 'I keep struggling with DP problems. What should I do?' }),
      timestamp: daysAgo(10).toISOString(),
    },
    {
      id: 'chat_2',
      role: 'assistant',
      content: JSON.stringify({
        mentorMessage:
          "DP problems feel hard because they require recognizing subproblem structure before writing a single line of code. Your current mastery score in DP is 45% — that's actually not bad for a topic this complex! I'd suggest this 3-step approach: (1) Solve Fibonacci, Climbing Stairs, and House Robber to nail the 1D DP pattern. (2) Move to 2D DP with Longest Common Subsequence. (3) Only then attempt Coin Change variants. Focus on writing the recurrence relation on paper BEFORE coding. Shall I generate a 2-week DP study plan for you?",
      }),
      timestamp: daysAgo(10).toISOString(),
    },
    // Conversation 2 — Study plan request
    {
      id: 'chat_3',
      role: 'user',
      content: JSON.stringify({ text: 'Yes, please give me a 2-week plan to improve DP!' }),
      timestamp: daysAgo(9).toISOString(),
    },
    {
      id: 'chat_4',
      role: 'assistant',
      content: JSON.stringify({
        mentorMessage:
          "Here's your personalised 2-week DP sprint:\n\n**Week 1 — 1D DP Mastery**\n• Day 1-2: Fibonacci, Climbing Stairs, House Robber (easy pattern recognition)\n• Day 3-4: Jump Game I & II (greedy DP overlap)\n• Day 5-7: Coin Change, Unbounded Knapsack\n\n**Week 2 — 2D & String DP**\n• Day 1-3: LCS, Edit Distance (write transitions first!)\n• Day 4-5: Longest Increasing Subsequence (patience sorting trick)\n• Day 6-7: Partition Equal Subset Sum (0/1 Knapsack)\n\nTarget: solve 2 problems per day. Your heatmap should show consistent activity. You're currently at 45% mastery — by end of week 2 you should be hitting 65%+. Let me know if you want me to adjust difficulty.",
      }),
      timestamp: daysAgo(9).toISOString(),
    },
    // Conversation 3 — Graph question
    {
      id: 'chat_5',
      role: 'user',
      content: JSON.stringify({ text: "I solved Number of Islands but I don't understand when to use BFS vs DFS for graphs." }),
      timestamp: daysAgo(4).toISOString(),
    },
    {
      id: 'chat_6',
      role: 'assistant',
      content: JSON.stringify({
        mentorMessage:
          "Great question — this is one of the most common interview confusions! Here's the mental model:\n\n**Use BFS when:**\n• You need SHORTEST path (BFS explores level by level)\n• Problems like Rotting Oranges, 0/1 Matrix, Word Ladder\n• Think: 'how many steps to reach X?'\n\n**Use DFS when:**\n• You need to EXPLORE all possibilities or check connectivity\n• Problems like Number of Islands, Clone Graph, Surrounded Regions\n• Think: 'does a path exist?' or 'mark all connected nodes'\n\nFor Number of Islands specifically: DFS is perfect because you just need to mark all connected land cells — no shortest path needed. You called it correctly! Your Graphs mastery is at 60% which is solid. I'd recommend Course Schedule next to understand topological sort (DFS on directed graphs). Want me to walk through the detection of cycles in directed vs undirected graphs?",
      }),
      timestamp: daysAgo(4).toISOString(),
    },
  ];

  await setDoc(
    doc(db, 'users', uid),
    {
      displayName: 'Demo Account',
      email: 'demo@grindsync.com',
      photoURL: '',
      updatedAt: serverTimestamp(),
      stats: {
        totalSolved: 30,
        currentStreak: 5,
        longestStreak: 12,
        lastSolvedDate: new Date().toISOString(),
        weakTopics: ['DP', 'Backtracking'],
        strongTopics: ['Arrays', 'Trees'],
      },
      preferences: {
        revisionIntervalDays: 3,
        dailyGoal: 5,
        platforms: ['leetcode', 'codeforces'],
      },
      mentorChatHistory,
    },
    { merge: true },
  );
  console.log('✅ User document updated.\n');

  console.log('════════════════════════════════════════════');
  console.log('🎉 Demo account fully seeded!');
  console.log('   Email:    demo@grindsync.com');
  console.log('   Password: Demo@123');
  console.log('   Questions seeded:   30');
  console.log('   Revisions due today: 5 (4 pending + 1 snoozed)');
  console.log('   Group:   "SDE 2026 Prep" with 4 members');
  console.log('   Challenges:  3 completed (2W / 1L)');
  console.log('   AI Chat:     3 conversations (6 messages)');
  console.log('   Heatmap:     Activity spread across last 30 days');
  console.log('   Topic mastery: Arrays ~80%, DP ~45%, Graphs ~60%');
  console.log('════════════════════════════════════════════\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
