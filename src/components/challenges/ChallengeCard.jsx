import { useChallenge } from '../../hooks/useChallenge'
import { useAuth } from '../../context/AuthContext'
import { Code2, Trophy, Clock, Swords, RefreshCw } from 'lucide-react'
import ProgressiveImage from '../ui/ProgressiveImage'

export default function ChallengeCard({ challenge, onSolve }) {
  const { currentUser } = useAuth()
  const { timeLeftMs } = useChallenge(challenge.expiresAt)
  const totalSecs = Math.floor(Math.max(0, timeLeftMs) / 1000)
  const hrs = Math.floor(totalSecs / 3600)
  const mins = Math.floor((totalSecs % 3600) / 60)
  const timeLeftDisplay = totalSecs <= 0
    ? 'Expired'
    : `${hrs}h ${mins}m remaining`

  const isChallenger = challenge.challenger?.userId === currentUser?.uid
  const isChallenged = challenge.challenged?.userId === currentUser?.uid

  const myRole = isChallenger ? 'challenger' : isChallenged ? 'challenged' : null
  const opponentRole = isChallenger ? 'challenged' : 'challenger'
  
  const myData = challenge[myRole] || challenge.challenger
  const opponentData = challenge[opponentRole] || challenge.challenged

  const myStatus = myData?.status
  const canSolve = challenge.status !== 'completed' && myStatus === 'pending'
  
  const isCompleted = challenge.status === 'completed' || timeLeftMs <= 0

  if (isCompleted) {
    const iWon = challenge.winner === myData?.userId
    const isDraw = challenge.winner === 'draw'
    
    const myTime = myData?.timeTakenMins || 0
    const oppTime = opponentData?.timeTakenMins || 0
    const maxTime = Math.max(myTime, oppTime, 1) // avoid div by 0

    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded">Completed</span>
            <h3 className="text-base font-bold text-zinc-100 mt-2">{challenge.questionTitle}</h3>
          </div>
          {iWon ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-amber-400 mt-1">Victory!</span>
            </div>
          ) : isDraw ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center border border-zinc-600">
                <Swords className="w-5 h-5 text-zinc-400" />
              </div>
              <span className="text-xs font-bold text-zinc-400 mt-1">Draw</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <span className="text-lg">😅</span>
              </div>
              <span className="text-xs font-bold text-zinc-500 mt-1">Almost!</span>
            </div>
          )}
        </div>

        {/* Time Comparison Bar Chart */}
        <div className="space-y-3 mt-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-indigo-400 font-semibold">You ({myTime}m)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(myTime / maxTime) * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-500 font-medium">{opponentData?.displayName} ({oppTime}m)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${(oppTime / maxTime) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <button className="w-full mt-5 py-2 flex items-center justify-center gap-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-sm font-semibold text-zinc-300 transition-colors">
          <RefreshCw className="w-4 h-4" /> Rematch
        </button>
      </div>
    )
  }

  // Active Challenge View
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5 shadow-[0_0_15px_rgba(99,102,241,0.15)] animate-pulse-glow transition-all hover:-translate-y-1">
      <div className="absolute top-0 right-0 p-3 flex items-center gap-1.5 bg-red-500/10 text-red-400 rounded-bl-xl border-l border-b border-red-500/20">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-xs font-mono font-bold">{timeLeftDisplay}</span>
      </div>

      <h3 className="text-lg font-bold text-white pr-24 mt-1">{challenge.questionTitle}</h3>
      <p className="text-xs text-indigo-300/70 mt-1 uppercase tracking-wider font-semibold">{challenge.topic} • {challenge.difficulty}</p>

      {/* Progress Comparison */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center">
          <ProgressiveImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${myData?.displayName || 'A'}`} alt="You" className="mb-2 h-12 w-12 rounded-full border-2 border-indigo-500 bg-indigo-500/20" />
          <span className="text-xs font-bold text-indigo-300">You</span>
          {myStatus === 'completed' ? (
             <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded mt-1">Finished!</span>
          ) : (
             <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded mt-1">Solving...</span>
          )}
        </div>
        
        <div className="shrink-0 text-2xl font-black text-indigo-500/30 italic">VS</div>
        
        <div className="flex-1 flex flex-col items-center">
          <ProgressiveImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${opponentData?.displayName || 'B'}`} alt="Opponent" className="mb-2 h-12 w-12 rounded-full border-2 border-zinc-700 bg-zinc-800 opacity-70" />
          <span className="text-xs font-bold text-zinc-400">{opponentData?.displayName}</span>
          {opponentData?.status === 'completed' ? (
             <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded mt-1">Finished!</span>
          ) : (
             <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded mt-1">Solving...</span>
          )}
        </div>
      </div>

      {myStatus === 'completed' && opponentData?.status === 'pending' && (
        <div className="mt-5 text-center p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10">
           <span className="text-xs font-bold text-emerald-400">🔥 You're currently ahead! Waiting for {opponentData.displayName}...</span>
        </div>
      )}

      {canSolve && (
        <button 
          onClick={() => onSolve(challenge)}
          className="w-full mt-5 py-3 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02]"
        >
          <Code2 className="w-5 h-5" /> Jump In & Solve
        </button>
      )}
    </div>
  )
}
