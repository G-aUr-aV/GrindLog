const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getAnalysisPrompt } = require('./prompt');
require('dotenv').config();

// Initialize Gemini (fallback)
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Cerebras API configuration (default)
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || 'gpt-oss-120b';
const CEREBRAS_FALLBACK_MODEL = process.env.CEREBRAS_FALLBACK_MODEL;

// Gemini configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

/**
 * Calls Cerebras API using OpenAI-compatible format
 */
const callCerebras = async (prompt, model = CEREBRAS_MODEL) => {
  const response = await fetch(CEREBRAS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Cerebras API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Calls Gemini API as fallback
 */
const callGemini = async (prompt) => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY not set');
  }
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Analyzes solved problems using Cerebras (default) with Gemini fallback.
 * @param {Array<object>} problems - Array of problem objects solved by the user.
 * @param {object} options - Options containing startDate and endDate.
 * @returns {Promise<string>} - A string containing the HTML analysis.
 */
const analyzeSolvedProblems = async (problems, { startDate, endDate } = {}) => {
  if (!CEREBRAS_API_KEY && !genAI) {
    console.warn('No LLM API keys configured. Skipping analysis.');
    return '<p>Personalized analysis is currently unavailable.</p>';
  }

  if (!problems || problems.length === 0) {
    return '<p>No problems were solved yesterday. Keep up the grind!</p>';
  }

  const problemList = problems.map(p => `- ${p.title} on ${p.platform} (${p.url})`).join('\n');
  const prompt = getAnalysisPrompt(problemList, { startDate, endDate });

  // Try Cerebras first (primary model)
  if (CEREBRAS_API_KEY) {
    try {
      console.log(`Analyzing ${problems.length} problems with Cerebras (${CEREBRAS_MODEL})...`);
      const text = await callCerebras(prompt);
      return text.replace(/```html/g, '').replace(/```/g, '').trim();
    } catch (error) {
      console.error('Error calling Cerebras primary model:', error.message);

      // Try Cerebras fallback model if configured
      if (CEREBRAS_FALLBACK_MODEL) {
        try {
          console.log(`Retrying with Cerebras fallback model (${CEREBRAS_FALLBACK_MODEL})...`);
          const text = await callCerebras(prompt, CEREBRAS_FALLBACK_MODEL);
          return text.replace(/```html/g, '').replace(/```/g, '').trim();
        } catch (fallbackError) {
          console.error('Error calling Cerebras fallback model:', fallbackError.message);
        }
      }
    }
  }

  // Fall back to Gemini
  if (genAI) {
    try {
      console.log(`Falling back to Gemini (${GEMINI_MODEL})...`);
      const text = await callGemini(prompt);
      return text.replace(/```html/g, '').replace(/```/g, '').trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error.message);
    }
  }

  return '<p>There was an error generating your personalized analysis. We will try again tomorrow!</p>';
};

module.exports = {
  analyzeSolvedProblems,
};