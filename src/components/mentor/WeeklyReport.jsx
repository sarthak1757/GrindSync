import Card from '../ui/Card'

export default function WeeklyReport({ report }) {
  return (
    <Card title="Weekly Mentor Report">
      <p className="text-sm text-zinc-300">{report?.mentorMessage || 'No report yet. Generate your Monday report from AI Mentor.'}</p>
      {!!report?.weeklyFocus?.length && (
        <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-zinc-400">
          {report.weeklyFocus.map((focus) => <li key={focus}>{focus}</li>)}
        </ul>
      )}
    </Card>
  )
}
