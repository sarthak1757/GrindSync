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
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      temperature: 0.6,
    })

    const raw = response.choices[0]?.message?.content || '{}'
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim()

    return JSON.parse(cleaned)
  } catch (err) {
    console.error('[Mentor API Error]', err)
    throw new Error('Failed to reach AI Mentor: ' + err.message)
  }
}

/**
 * Analyses the user's weak/strong topics and returns a structured report.
 * @param {object} input – { totalSolved, topicBreakdown, recentQuestions, ... }
 */
export function generateMentorAnalysis(input) {
  return callGroqJson([
    { 
      role: 'system', 
      content: SYSTEM_PROMPT + '\nYour response MUST strictly be a JSON object with this shape: { "weakTopics": [{ "topic": "string", "urgency": "low"|"medium"|"high", "recommendation": "string" }], "readinessScore": number (0-100) }.'
    },
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
    { 
      role: 'system', 
      content: SYSTEM_PROMPT + `\nYour response MUST strictly be a JSON object with this shape:
{
  "overview": "string",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "string",
      "dailyGoal": number,
      "topics": ["string"],
      "specificQuestions": [
        { "title": "string", "difficulty": "string", "why": "string" }
      ],
      "milestone": "string"
    }
  ],
  "tips": ["string"]
}
Create a high-quality 4-week preparation plan targeted at the user's placement goal.`
    },
    {
      role: 'user',
      content: JSON.stringify({ task: '4-week-study-plan', ...input }),
    },
  ])
}

/**
 * Continues a back-and-forth mentor chat.
 * @param {Array<{role: string, content: string}>} history
 * @param {object} context – student performance context
 */
export function sendMentorChat(history, context) {
  const messages = [
    { 
      role: 'system', 
      content: SYSTEM_PROMPT + '\nYour response MUST strictly be a JSON object with this shape: { "mentorMessage": "your prose response to the user" }.'
    },
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

export async function verifyCodeSolution(title, url, sourceCode) {
  return callGroqJson([
    {
      role: 'system',
      content: `You are an expert competitive programming judge API.
You will be given a problem title, URL, and the user's submitted source code.
Your singular job is to read the source code and determine if it correctly solves the problem's logic.
Ignore minor syntax flaws if the algorithm is perfectly sound.

You MUST strictly reply with a JSON object of this exact schema:
{
  "isCorrect": boolean,
  "feedback": "A very short, 1-2 sentence string. If correct, praise them. If incorrect, point out the logical flaw (e.g. O(N^2) instead of O(N) or completely wrong approach)."
}`
    },
    {
      role: 'user',
      content: JSON.stringify({ questionTitle: title, questionUrl: url, userCode: sourceCode })
    }
  ])
}
