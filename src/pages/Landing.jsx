import { createElement, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Brain,
  Bot,
  Swords,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  GitBranch,
  Star,
} from 'lucide-react'

// ── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

// ── Mini heatmap data ────────────────────────────────────────────────────────
function generateHeatmap() {
  const cells = []
  for (let i = 0; i < 70; i++) {
    const rand = Math.random()
    const level = rand > 0.7 ? 3 : rand > 0.5 ? 2 : rand > 0.3 ? 1 : 0
    cells.push(level)
  }
  return cells
}

const HEAT_COLORS = [
  'bg-zinc-800',
  'bg-indigo-900/70',
  'bg-indigo-600/80',
  'bg-indigo-400',
]

// ── Floating question card data ───────────────────────────────────────────────
const FLOAT_CARDS = [
  { title: 'Two Sum', topic: 'Arrays', mastery: 92, felt: 'easy',  interval: '14d' },
  { title: 'Coin Change', topic: 'DP', mastery: 41, felt: 'hard', interval: '1d'  },
  { title: 'Number of Islands', topic: 'Graphs', mastery: 67, felt: 'okay', interval: '5d' },
]

function MasteryBar({ score }) {
  const color =
    score >= 75 ? 'from-emerald-500 to-green-400' :
    score >= 50 ? 'from-indigo-500 to-violet-400' :
                  'from-rose-500 to-pink-400'
  return (
    <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-700/60">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

function FloatingCard({ card, className }) {
  return (
    <div
      className={`${className} w-52 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md shadow-2xl`}
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <p className="text-xs font-semibold text-zinc-100">{card.title}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">{card.topic}</p>
        </div>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
            card.felt === 'easy' ? 'bg-emerald-500/20 text-emerald-300' :
            card.felt === 'hard' ? 'bg-rose-500/20 text-rose-300' :
                                   'bg-indigo-500/20 text-indigo-300'
          }`}
        >
          {card.felt}
        </span>
      </div>
      <MasteryBar score={card.mastery} />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-zinc-500">Mastery {card.mastery}%</span>
        <span className="text-[10px] text-indigo-400">↻ {card.interval}</span>
      </div>
    </div>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, iconBg, title, description, delay }) {
  return (
    <div
      className={`animate-fade-in ${delay} group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm
        transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/40 hover:shadow-[0_0_40px_rgba(99,102,241,0.12)]`}
    >
      {/* shimmer overlay on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
        {createElement(Icon, { className: 'h-6 w-6' })}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-100">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  )
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, delay, started }) {
  const count = useCountUp(value, 2200, started)
  return (
    <div className={`animate-count-up ${delay} flex flex-col items-center gap-1`}>
      <div className="flex items-center gap-2 text-indigo-400">
        {createElement(Icon, { className: 'h-5 w-5' })}
        <span className="text-3xl font-extrabold text-zinc-100 tabular-nums">
          {count.toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Landing() {
  const statsRef = useRef(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [heatmap]  = useState(generateHeatmap)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 },
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">

      {/* ── Nav bar ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">GrindSync</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-zinc-400 transition hover:text-zinc-100"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              state={{ register: true }}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16">

        {/* Gradient background */}
        <div
          className="animate-gradient-shift absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(135deg, #1e1b4b 0%, #3b0764 40%, #4a044e 70%, #1e1b4b 100%)',
          }}
        />
        {/* Radial glow blobs */}
        <div className="pointer-events-none absolute -z-10">
          <div className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-pink-600/10 blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur">
          <Star className="h-3 w-3 fill-indigo-400 text-indigo-400" />
          AI-powered DSA revision — built for placement prep
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in delay-100 mx-auto max-w-4xl text-center text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl md:text-7xl">
          Master DSA Through{' '}
          <span
            className="animate-gradient-shift bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #818cf8, #c084fc, #f472b6, #818cf8)',
              backgroundSize: '200% auto',
            }}
          >
            Spaced Repetition
          </span>
        </h1>

        <p className="animate-fade-in delay-200 mx-auto mt-6 max-w-2xl text-center text-lg leading-relaxed text-zinc-300">
          AI-powered revision system that ensures you{' '}
          <strong className="text-zinc-100">never forget a pattern</strong>.
          Track questions, beat challenges, and prep smarter — not longer.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/login"
            state={{ register: true }}
            className="animate-pulse-glow group flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:scale-105"
          >
            Start Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-zinc-200 backdrop-blur transition-all hover:bg-white/10 hover:scale-105"
          >
            View Features
          </a>
        </div>


        {/* Floating cards */}
        <div className="pointer-events-none relative mt-16 hidden h-48 w-full max-w-5xl md:block">
          <FloatingCard card={FLOAT_CARDS[0]} className="animate-float absolute left-4 top-0" />
          <FloatingCard card={FLOAT_CARDS[1]} className="animate-float-slow absolute left-1/2 -translate-x-1/2 -top-6" />
          <FloatingCard card={FLOAT_CARDS[2]} className="animate-float-med absolute right-4 top-2" />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="relative py-24 px-4">
        <div className="mx-auto max-w-6xl">
          {/* Section label */}
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Core Features
            </span>
          </div>
          <h2 className="mb-4 text-center text-4xl font-extrabold tracking-tight">
            Everything you need to{' '}
            <span className="text-indigo-400">actually retain</span> what you learn
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-zinc-400">
            GrindSync is not just a tracker. It's a full revision engine that combines science with accountability.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Brain}
              iconBg="bg-indigo-500/15 text-indigo-400"
              title="Smart Spaced Repetition"
              description="Questions resurface exactly when you're about to forget. Our algorithm adapts to your solve time and self-rating, scheduling harder topics more aggressively."
              delay="delay-100"
            />
            <FeatureCard
              icon={Bot}
              iconBg="bg-purple-500/15 text-purple-400"
              title="AI Mentor"
              description="A personal coach that analyzes your weak spots across topics. Ask it anything — it knows your solve history and tailors advice to where you actually struggle."
              delay="delay-200"
            />
            <FeatureCard
              icon={Swords}
              iconBg="bg-rose-500/15 text-rose-400"
              title="Competitive Challenges"
              description="Race your friends on the same problem, see who solves it faster. Build accountability through friendly rivalry and weekly group leaderboards."
              delay="delay-300"
            />
            <FeatureCard
              icon={TrendingUp}
              iconBg="bg-emerald-500/15 text-emerald-400"
              title="Mastery Tracking"
              description="Every question has a live mastery score. Watch it grow as you revisit, or drop when you take too long — honest feedback that keeps you honest."
              delay="delay-100"
            />
            <FeatureCard
              icon={CheckCircle2}
              iconBg="bg-amber-500/15 text-amber-400"
              title="Solve History Heatmap"
              description="A GitHub-style activity heatmap shows your consistency at a glance. Daily streaks, weekly density — your effort visualized beautifully."
              delay="delay-200"
            />
            <FeatureCard
              icon={GitBranch}
              iconBg="bg-zinc-500/15 text-zinc-300"
              title="Browser Extension"
              description="Solved a question on LeetCode or Codeforces? The extension detects it and auto-logs it to GrindSync. Zero friction — your revision queue grows automatically."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* ── Social proof + heatmap ───────────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="relative overflow-hidden py-24 px-4"
      >
        {/* Background blob */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <div className="h-[400px] w-[800px] rounded-full bg-indigo-600/8 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Traction
            </span>
          </div>
          <h2 className="mb-14 text-center text-4xl font-extrabold tracking-tight">
            Built for students, by students
          </h2>

          {/* Stats row */}
          <div className="mb-16 grid gap-10 sm:grid-cols-3">
            <StatPill icon={Zap}       value={2847} label="questions tracked"         delay="delay-100" started={statsVisible} />
            <StatPill icon={TrendingUp} value={487}  label="students prepping for placements" delay="delay-300" started={statsVisible} />
            <StatPill icon={Star}       value={94}   label="% retention improvement"  delay="delay-500" started={statsVisible} />
          </div>

          {/* Mini heatmap */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-300">Activity over last 10 weeks</p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>Less</span>
                {HEAT_COLORS.map((c, i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-sm ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(35, minmax(0, 1fr))' }}>
              {heatmap.map((level, i) => (
                <div
                  key={i}
                  title={`${level > 0 ? level * 2 : 0} questions`}
                  className={`aspect-square rounded-sm ${HEAT_COLORS[level]} transition-transform hover:scale-125`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex justify-center">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400">
              How It Works
            </span>
          </div>
          <h2 className="mb-14 text-center text-4xl font-extrabold tracking-tight">
            Three steps to never forgetting
          </h2>

          <div className="relative flex flex-col gap-0">
            {[
              {
                step: '01',
                color: 'indigo',
                title: 'Solve & Log',
                body: 'Solve a question on any platform. Log it via the browser extension or manually — one click.',
              },
              {
                step: '02',
                color: 'purple',
                title: 'Algorithm Schedules Revision',
                body: 'Our spaced repetition engine analyses your time, rating, and mastery score to schedule the perfect review moment.',
              },
              {
                step: '03',
                color: 'pink',
                title: 'Revise & Retain',
                body: 'Your revision queue shows exactly what to study today. Mark easy/okay/hard — the algorithm adapts.',
              },
            ].map(({ step, color, title, body }, i) => (
              <div key={i} className="group relative flex gap-6 pb-12 last:pb-0">
                {/* connector line */}
                {i < 2 && (
                  <div className="absolute left-[22px] top-12 bottom-0 w-px bg-gradient-to-b from-zinc-700 to-transparent" />
                )}
                <div
                  className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2
                    border-${color}-500/50 bg-${color}-500/10 text-sm font-bold text-${color}-400
                    transition-all group-hover:border-${color}-400 group-hover:bg-${color}-500/20`}
                >
                  {step}
                </div>
                <div className="pt-1.5">
                  <h3 className="mb-1 text-lg font-semibold text-zinc-100">{title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA footer ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-28">
        {/* gradient bg */}
        <div
          className="animate-gradient-shift absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #1e1b4b 100%)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-4xl font-extrabold leading-tight md:text-5xl">
            Ready to stop forgetting DSA patterns?
          </h2>
          <p className="mb-10 text-lg text-zinc-300">
            Join students who are studying smarter with AI-driven revision, accountability groups, and competitive challenges.
          </p>
          <Link
            to="/login"
            className="animate-pulse-glow group inline-flex items-center gap-3 rounded-2xl bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:bg-indigo-500 hover:scale-105"
          >
            Get Started — It's Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-5 text-sm text-zinc-500">
            No credit card required · Works with LeetCode & Codeforces
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Zap className="h-4 w-4 text-indigo-500" />
            <span>GrindSync — Smart DSA Prep</span>
          </div>
          <p className="text-xs text-zinc-600">
            Built with React · Firebase · Spaced Repetition · ❤️
          </p>
        </div>
      </footer>
    </main>
  )
}
