import Anthropic from '@anthropic-ai/sdk'

const mentorSystemPrompt = `You are a DSA preparation mentor named Mentor. You analyse\nstudent performance data and give specific, actionable,\nencouraging advice. Always respond in valid JSON only.`

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

async function callClaudeJson(payload) {
  const response = await client.messages.create({
    model: import.meta.env.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
    max_tokens: 800,
    system: mentorSystemPrompt,
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  })

  const textBlock = response.content.find((item) => item.type === 'text')
  const raw = textBlock?.text || '{}'
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(cleaned)
}

export function generateMentorAnalysis(input) {
  return callClaudeJson({ task: 'weakness-analysis', ...input })
}

export function generateStudyPlan(input) {
  return callClaudeJson({ task: 'weekly-study-plan', ...input })
}

export function sendMentorChat(history, context) {
  return callClaudeJson({ task: 'chat', history, context })
}
