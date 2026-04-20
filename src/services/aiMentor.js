import Groq from 'groq-sdk'

const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are a DSA preparation mentor named Mentor.
You analyse student performance data and give specific, actionable, encouraging advice.
Always respond with valid JSON only — no markdown fences, no prose outside the JSON.`

const client = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Sends a chat completion request and parses the JSON response.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<object>}
 */
async function callGroqJson(messages) {
  const response = await client.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    temperature: 0.6,
  })

  const raw = response.choices[0]?.message?.content || '{}'
  // Strip any accidental markdown fences just in case
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  return JSON.parse(cleaned)
}

/**
 * Analyses the user's weak/strong topics and returns a structured report.
 * @param {object} input – { totalSolved, topicBreakdown, recentQuestions, ... }
 */
export function generateMentorAnalysis(input) {
  return callGroqJson([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({ task: 'weakness-analysis', ...input }),
    },
  ])
}

/**
 * Generates a personalised weekly study plan.
 * @param {object} input – same shape as generateMentorAnalysis
 */
export function generateStudyPlan(input) {
  return callGroqJson([
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({ task: 'weekly-study-plan', ...input }),
    },
  ])
}

/**
 * Continues a back-and-forth mentor chat.
 * @param {Array<{role: string, content: string}>} history
 * @param {object} context – student performance context
 */
export function sendMentorChat(history, context) {
  // Build full message list: system → context injection → chat history
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: JSON.stringify({ task: 'context', ...context }),
    },
    { role: 'assistant', content: '{"received":"context acknowledged"}' },
    // Spread actual conversation history
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content),
    })),
  ]

  return callGroqJson(messages)
}
