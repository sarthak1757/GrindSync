import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import ChallengeCard from '../components/challenges/ChallengeCard'
import GroupCard from '../components/groups/GroupCard'
import Modal from '../components/ui/Modal'
import ProgressiveImage from '../components/ui/ProgressiveImage'
import EmptyState from '../components/ui/EmptyState'
import { useGroups } from '../context/GroupContext'
import { useAuth } from '../context/AuthContext'
import { calculateWeeklyScore } from '../utils/scoreCalculator'
import { Swords, Plus, LogIn, Crown, Trophy, Target, ChevronRight, Activity } from 'lucide-react'

export default function Groups() {
  const { groups, challenges, createNewGroup, joinGroup } = useGroups()
  const { currentUser } = useAuth()
  
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  const create = async (e) => {
    e.preventDefault()
    try {
      await createNewGroup({
        name,
        description: 'Focused DSA accountability group',
        goal: { type: 'placement', targetDate, description: goal },
        weeklyGoal: { questionsPerMember: 10, revisionsPerMember: 8 },
      })
      toast.success('Group created')
      setShowCreateModal(false)
      setName('')
      setGoal('')
      setTargetDate('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const join = async (e) => {
    e.preventDefault()
    try {
      await joinGroup(inviteCode)
      toast.success('Joined group')
      setShowJoinModal(false)
      setInviteCode('')
    } catch (err) {
      toast.error(err.message)
    }
  }

  // Generate Global Leaderboard from all groups
  const globalLeaderboard = useMemo(() => {
    const membersMap = new Map()
    groups.forEach(g => {
      g.members?.forEach(m => {
        if (!membersMap.has(m.userId)) {
          membersMap.set(m.userId, {
            ...m,
            score: calculateWeeklyScore(m.weeklyStats || {})
          })
        }
      })
    })
    return Array.from(membersMap.values()).sort((a, b) => b.score - a.score)
  }, [groups])

  const top3 = globalLeaderboard.slice(0, 3)
  const restOfBoard = globalLeaderboard.slice(3, 10)
  
  const podiumOrder = [
    top3[1] && { ...top3[1], rank: 2, height: 'h-32', gradient: 'from-zinc-400 to-zinc-600', ring: 'ring-zinc-400' },
    top3[0] && { ...top3[0], rank: 1, height: 'h-40', gradient: 'from-yellow-400 to-amber-600', ring: 'ring-yellow-400', isFirst: true },
    top3[2] && { ...top3[2], rank: 3, height: 'h-24', gradient: 'from-amber-700 to-amber-900', ring: 'ring-amber-700' }
  ].filter(Boolean)

  // Split challenges
  const myChallenges = useMemo(() => {
    return challenges.filter(c => 
      c.challenger?.userId === currentUser?.uid || 
      c.challenged?.userId === currentUser?.uid
    )
  }, [challenges, currentUser])

  const activeChallenges = myChallenges.filter(c => c.status !== 'completed' && c.expiresAt > now)
  const completedChallenges = myChallenges.filter(c => c.status === 'completed' || c.expiresAt <= now)

  return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      
      {/* ── ARENA HEADER ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Swords className="w-8 h-8 text-rose-500" /> The Arena
          </h1>
          <p className="text-zinc-400 mt-1 font-medium">Compete, collaborate, and dominate the leaderboards.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowJoinModal(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold transition-all border border-zinc-700">
            <LogIn className="w-4 h-4" /> Join
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Plus className="w-4 h-4" /> Create Squad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── GLOBAL LEADERBOARD (Podium) ─────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-8 z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Global Leaderboard
            </h2>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800 px-3 py-1 rounded-full">Top 10</span>
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-2 sm:gap-6 mt-4 mb-10 h-48 z-10">
            {podiumOrder.map((user) => (
              <div key={user.userId} className="flex flex-col items-center group relative w-24 sm:w-32">
                {user.isFirst && <Crown className="w-8 h-8 text-yellow-400 mb-2 absolute -top-12 animate-bounce drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />}
                <ProgressiveImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} 
                  alt={user.displayName}
                  className={`z-10 mb-[-20px] h-14 w-14 rounded-full border-4 border-zinc-900 bg-white ring-2 sm:h-16 sm:w-16 ${user.ring} group-hover:-translate-y-2 transition-transform duration-300`}
                />
                <div className={`w-full ${user.height} rounded-t-xl bg-gradient-to-t ${user.gradient} opacity-90 shadow-xl flex flex-col items-center justify-start pt-6`}>
                  <span className="text-white font-black text-xl drop-shadow-md">{user.rank}</span>
                  <span className="text-white/80 font-bold text-xs truncate w-full text-center px-1 drop-shadow-md mt-1">{user.displayName}</span>
                  <span className="text-white font-mono font-bold text-[10px] mt-1 bg-black/20 px-2 py-0.5 rounded">{user.score}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Rest of Leaderboard */}
          <div className="space-y-2 z-10">
            {restOfBoard.map((user, idx) => {
              const isMe = user.userId === currentUser?.uid;
              return (
                <div key={user.userId} className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isMe ? 'bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]' : 'bg-zinc-950/50 border border-zinc-800 hover:bg-zinc-800'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center font-bold text-sm ${isMe ? 'text-amber-400' : 'text-zinc-500'}`}>{idx + 4}</span>
                    <ProgressiveImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`} alt="avatar" className="h-8 w-8 rounded-full bg-zinc-800" />
                    <span className={`font-semibold text-sm ${isMe ? 'text-amber-200' : 'text-zinc-200'}`}>
                      {user.displayName} {isMe && '(You)'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-indigo-300">{user.score}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── SQUADS & CHALLENGES RIGHT COLUMN ────────────────────────────── */}
        <div className="space-y-8">
          
          {/* Active Challenges */}
          <div className="flex flex-col rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-6 z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" /> Live Challenges
              </h2>
              {activeChallenges.length > 0 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>}
            </div>
            
            <div className="space-y-4">
              {activeChallenges.length > 0 ? (
                activeChallenges.map(c => <ChallengeCard key={c.id} challenge={c} />)
              ) : (
                <EmptyState
                  icon={Swords}
                  title="No live challenges"
                  message="Open a squad and issue a timed problem when your friends are ready."
                  actionLabel="View Squads"
                  onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              )}
            </div>
          </div>

          {/* My Squads */}
          <div className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> My Squads
              </h2>
            </div>
            <div className="space-y-3">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <Link key={group.id} to={`/groups/${group.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all">
                    <div>
                      <h3 className="font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors">{group.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">{group.members?.length || 0} members</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  </Link>
                ))
              ) : (
                <EmptyState
                  icon={Target}
                  title="No squads yet"
                  message="Create a focused squad or join one with an invite code to make prep feel less solo."
                  actionLabel="Create Squad"
                  onAction={() => setShowCreateModal(true)}
                />
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Completed Challenges History */}
      {completedChallenges.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-6">Recent Match History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedChallenges.map(c => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create a Squad">
        <form className="space-y-4" onSubmit={create}>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Squad Name</label>
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="e.g. FAANG Hustlers" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Main Goal</label>
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" placeholder="e.g. Google Fall Internships" value={goal} onChange={(e) => setGoal(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Target Date</label>
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" type="date" value={targetDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setTargetDate(e.target.value)} required />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] mt-2">
            Form Squad
          </button>
        </form>
      </Modal>

      <Modal open={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join a Squad">
        <form className="space-y-4" onSubmit={join}>
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Invite Code</label>
            <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="ABC123" required />
          </div>
          <button type="submit" className="w-full py-3 bg-zinc-200 hover:bg-white text-zinc-900 font-bold rounded-xl transition-all mt-2">
            Join Squad
          </button>
        </form>
      </Modal>

    </div>
  )
}
