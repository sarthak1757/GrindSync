import { useState, useMemo } from 'react'
import { Flame, Medal, Target, Zap, Clock, Star, Trophy, Activity, Calendar as CalendarIcon } from 'lucide-react'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { useAuth } from '../context/AuthContext'
import { useQuestions } from '../context/QuestionContext'
import { useGroups } from '../context/GroupContext'
import { useProfileStats } from '../hooks/useProfileStats'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899']

const ICONS = {
  zap: <Zap className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  star: <Star className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
}

export default function Profile() {
  const { currentUser } = useAuth()
  const { questions } = useQuestions()
  const { challenges } = useGroups()

  const stats = useProfileStats(questions, challenges, currentUser)
  
  // Modal State for Heatmap Click
  const [selectedDate, setSelectedDate] = useState(null)
  
  const getQuestionsForDate = (dateStr) => {
    const solvedThatDay = []
    questions.forEach(q => {
      const hist = Array.isArray(q.solveHistory) ? q.solveHistory : []
      hist.forEach(h => {
        if (!h.solvedAt) return
        const hDate = typeof h.solvedAt.toDate === 'function' ? h.solvedAt.toDate() : new Date(h.solvedAt)
        if (format(hDate, 'yyyy-MM-dd') === dateStr) {
          solvedThatDay.push({
            title: q.title,
            difficulty: q.difficulty,
            time: h.timeTakenMins,
            id: q.id
          })
        }
      })
    })
    return solvedThatDay
  }

  const handleHeatmapClick = (value) => {
    if (!value || !value.date || value.count === 0) return
    setSelectedDate(value.date)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
          {currentUser?.displayName?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">{currentUser?.displayName || 'Grinder'}</h1>
          <p className="text-zinc-400">{currentUser?.email}</p>
        </div>
      </div>

      {/* STATS OVERVIEW SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border-zinc-800/80">
          <Medal className="w-8 h-8 text-indigo-400 mb-2" />
          <p className="text-sm font-medium text-zinc-400">Total Solved</p>
          <p className="text-3xl font-bold text-zinc-100">{stats.totalSolved}</p>
        </Card>
        
        <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border-zinc-800/80">
          <Flame className={`w-8 h-8 mb-2 ${stats.currentStreak > 0 ? 'text-orange-500' : 'text-zinc-600'}`} />
          <p className="text-sm font-medium text-zinc-400">Current Streak</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-zinc-100">{stats.currentStreak} 🔥</p>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Best: {stats.longestStreak} days</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border-zinc-800/80">
          <Clock className="w-8 h-8 text-emerald-400 mb-2" />
          <p className="text-sm font-medium text-zinc-400">Avg Solve Time</p>
          <p className="text-3xl font-bold text-zinc-100">{stats.avgSolveTime} <span className="text-lg text-zinc-500 font-normal">m</span></p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 border-zinc-800/80 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
          <Activity className="w-8 h-8 text-purple-400 mb-2" />
          <p className="text-sm font-medium text-zinc-400">Readiness Score</p>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">{stats.readinessScore}</p>
            <p className="text-sm text-zinc-500">/100</p>
          </div>
        </Card>
      </div>

      {/* SOLVE HISTORY CALENDAR */}
      <Card title="Solve History" className="bg-zinc-900/40">
        <div className="px-2 py-4 overflow-x-auto relative">
          <style dangerouslySetInnerHTML={{__html: `
            .react-calendar-heatmap text { font-size: 8px; fill: #71717a; }
            .react-calendar-heatmap .color-empty { fill: #27272a; }
            .react-calendar-heatmap .color-scale-1 { fill: #4f46e5; opacity: 0.4; }
            .react-calendar-heatmap .color-scale-2 { fill: #4f46e5; opacity: 0.6; }
            .react-calendar-heatmap .color-scale-3 { fill: #4f46e5; opacity: 0.8; }
            .react-calendar-heatmap .color-scale-4 { fill: #4ade80; } /* 5+ solves -> Green jump! */
            .react-calendar-heatmap rect:hover { stroke: #e4e4e7; stroke-width: 1px; cursor: pointer; }
          `}} />
          <div className="min-w-[700px]">
             <CalendarHeatmap
                startDate={stats.heatmapData[0]?.date || new Date()}
                endDate={new Date()}
                values={stats.heatmapData}
                classForValue={(value) => {
                  if (!value || value.count === 0) return 'color-empty'
                  if (value.count <= 2) return 'color-scale-1'
                  if (value.count <= 4) return 'color-scale-2'
                  if (value.count <= 6) return 'color-scale-3'
                  return 'color-scale-4'
                }}
                titleForValue={(value) => {
                  if (!value || !value.date) return 'No activity'
                  return `${value.count} problems solved on ${value.date}`
                }}
                onClick={handleHeatmapClick}
              />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TOPIC MASTERY BREAKDOWN */}
        <Card title="Topic Mastery Breakdown" className="bg-zinc-900/40">
          <div className="space-y-4 mt-2">
            {!stats.topicMastery.length && <p className="text-sm text-zinc-500">Solve some problems to see topic breakdown.</p>}
            {stats.topicMastery.map((tm) => (
              <div key={tm.topic}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-zinc-300 font-medium">{tm.topic}</span>
                  <span className="text-zinc-400">{tm.mastery}% ({tm.count})</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${tm.mastery}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ACHIEVEMENTS/BADGES */}
        <Card title="Achievements" className="bg-zinc-900/40">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {stats.badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  badge.unlocked 
                  ? 'border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'border-zinc-800 bg-zinc-900/30 opacity-50 grayscale'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${badge.unlocked ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {ICONS[badge.icon]}
                </div>
                <h4 className="text-sm font-semibold text-zinc-200">{badge.title}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">{badge.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TOPIC PIE CHART */}
        <Card title="Problem Distribution" className="bg-zinc-900/40 lg:col-span-1 min-h-[300px]">
          {!stats.topicMastery.length ? (
            <p className="text-sm text-zinc-500 mt-4">No data available.</p>
          ) : (
            <div className="h-64 w-full mt-4 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topicMastery.map(t => ({ name: t.topic, value: t.count }))}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.topicMastery.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* PERFORMANCE TRENDS */}
        <Card title="30-Day Performance Trends" className="bg-zinc-900/40 lg:col-span-2 min-h-[300px]">
           <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.trendData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickMargin={10} minTickGap={20} />
                  <YAxis yAxisId="left" stroke="#10b981" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line yAxisId="left" type="monotone" name="Avg Time (mins)" dataKey="avgSolveTime" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line yAxisId="right" type="step" name="Questions Solved" dataKey="questionsSolved" stroke="#6366f1" strokeWidth={2} dot={false} fill="#6366f1" fillOpacity={0.2} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </Card>
      </div>

      {/* RECENT ACTIVITY FEED */}
      <Card title="Recent Activity" className="bg-zinc-900/40">
        <div className="space-y-4 mt-2">
          {!stats.recentActivity.length && <p className="text-sm text-zinc-500">No recent activity found.</p>}
          {stats.recentActivity.map((activity) => (
             <div key={activity.id} className="flex gap-4 items-start relative pb-4 last:pb-0">
                <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-zinc-800 last:hidden"></div>
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-zinc-900 ${
                  activity.type === 'challenge' ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                }`}>
                  {activity.type === 'challenge' ? <Trophy className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                </div>
                <div className="pt-1.5">
                  <p className="text-sm text-zinc-200">{activity.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {format(activity.timestamp, 'MMM d, yyyy • h:mm a')}
                  </p>
                </div>
             </div>
          ))}
        </div>
      </Card>

      {/* HEATMAP MODAL */}
      <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)} title={`Activity on ${selectedDate}`}>
        <div className="space-y-3 pb-4">
          {selectedDate && getQuestionsForDate(selectedDate).length > 0 ? (
            getQuestionsForDate(selectedDate).map((q, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                <div>
                  <p className="text-sm font-medium text-emerald-400">{q.title}</p>
                  <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{q.difficulty}</p>
                </div>
                <div className="text-right">
                   <p className="text-lg font-mono text-zinc-300">{q.time}<span className="text-sm text-zinc-500">m</span></p>
                </div>
              </div>
            ))
          ) : (
             <p className="text-sm text-zinc-400 italic">No questions were recorded on this day.</p>
          )}
        </div>
      </Modal>

    </div>
  )
}
