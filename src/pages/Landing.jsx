import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function Landing() {
  return (
    <main className="flex min-h-screen items-center bg-zinc-950 px-4 text-zinc-100">
      <section className="mx-auto max-w-4xl text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.25em] text-indigo-300">Smart DSA prep</p>
        <h1 className="mb-4 text-4xl font-bold md:text-6xl">GrindSync</h1>
        <p className="mx-auto mb-8 max-w-2xl text-zinc-300">
          Smart revision, group accountability, peer challenges, and an AI mentor in one focused platform.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/login"><Button>Get Started</Button></Link>
          <a href="#features"><Button variant="ghost">Explore Features</Button></a>
        </div>
      </section>
    </main>
  )
}
