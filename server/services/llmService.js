const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getAnalysisPrompt } = require('./prompt');
require('dotenv').config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Analyzes solved problems using Gemini and returns an HTML report.
 * @param {Array<object>} problems - Array of problem objects solved by the user.
 * @param {object} options - Options containing startDate and endDate.
 * @returns {Promise<string>} - A string containing the HTML analysis.
 */
const analyzeSolvedProblems = async (problems, { startDate, endDate } = {}) => {
  if (!genAI) {
    console.warn('GEMINI_API_KEY not set. Skipping LLM analysis.');
    return '<p>Personalized analysis is currently unavailable.</p>';
  }
  if (!problems || problems.length === 0) {
    // This case is now handled by the motivational email, but as a fallback:
    return '<p>No problems were solved yesterday. Keep up the grind!</p>';
  }

  console.log(`Analyzing ${problems.length} problems with Gemini...`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

  const problemList = problems.map(p => `- ${p.title} on ${p.platform} (${p.url})`).join('\n');

  const prompt = getAnalysisPrompt(problemList, { startDate, endDate });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.replace(/```html/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return '<p>There was an error generating your personalized analysis. We will try again tomorrow!</p>';
  }
};

module.exports = {
  analyzeSolvedProblems,
};