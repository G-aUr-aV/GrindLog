const cron = require('node-cron');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const Problem = require('../models/Problem'); // Import the Problem model
const path = require('path');
const { analyzeSolvedProblems } = require('./llmService');

// --- Configuration ---
// Path to a file to track the last time the job ran, preventing multiple runs per day.
const LAST_RUN_FILE = path.join(__dirname, '..', '.last_run_daily_digest');


/**
 * Fetches all users who were active yesterday.
 * In a real app, you'd query your database for users with activity in the last 24 hours.
 */
const getAllActiveUsers = async () => {
    console.log('Fetching all active users from environment variable...');
    try {
        const usersJson = process.env.DAILY_DIGEST_USERS;
        if (!usersJson) {
            console.warn('DAILY_DIGEST_USERS environment variable not set. No users to process.');
            return [];
        }
        const users = JSON.parse(usersJson);
        if (!Array.isArray(users)) {
            console.error('DAILY_DIGEST_USERS is not a valid JSON array.');
            return [];
        }
        console.log(`Found ${users.length} users to process.`);
        return users;
    } catch (error) {
        console.error('Failed to parse users from DAILY_DIGEST_USERS environment variable:', error);
        return [];
    }
};

/**
 * Calculates the start and end dates based on a timeframe string.
 * @param {string} timeframe - e.g., 'yesterday', 'last7days', 'last30days'.
 * @returns {{startDate: Date, endDate: Date}}
 */
const getDateRangeFromTimeframe = (timeframe = 'yesterday') => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    let startDate;

    switch (timeframe) {
        case 'last7days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
        case 'last30days':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
            break;
        case 'yesterday':
        default:
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            break;
    }
    return { startDate, endDate: today };
};

/**
 * Fetches solved question data for a specific user within a given timeframe.
 * @param {object} user - The user object.
 * @param {object} options - Options containing startDate and endDate.
 */
const getSolvedDataForUser = async (user, { startDate, endDate }) => {
  let queryStart, queryEnd;

  if (startDate && endDate) {
    queryStart = new Date(startDate);
    queryEnd = new Date(endDate);
    queryEnd.setUTCHours(23, 59, 59, 999); // Ensure the entire end day is included
  } else {
    // Default to 'yesterday' for automatic cron job
    const range = getDateRangeFromTimeframe('yesterday');
    queryStart = range.startDate;
    queryEnd = range.endDate;
  }
  console.log(`Fetching data for ${user.email} from ${queryStart.toISOString()} to ${queryEnd.toISOString()}`);

  const problems = await Problem.find({
    // userId: user.id, // Removed as per request, as it's not in the DB schema.
    timestamp: { $gte: queryStart, $lt: queryEnd },
  }).lean();

  if (!problems || problems.length === 0) {
    return { totalSolved: 0, questions: [] };
  }
  return {
    totalSolved: problems.length,
    // Map to a simpler structure for the report and analysis
    questions: problems.map(p => ({ title: p.title, platform: p.platform, url: p.url})),
  };
};

// --- PDF Generation Service ---

/**
 * Generates a PDF report from user data using Puppeteer.
 * @param {object} user - The user object.
 * @param {object} data - The data for the report.
 * @param {string} analysisHtml - The HTML analysis from the LLM.
 * @param {object} options - Options containing startDate and endDate.
 * @returns {Promise<Buffer>} - A buffer containing the PDF data.
 */
const generatePdfReport = async (user, data, analysisHtml, { startDate, endDate }) => {
    console.log(`Generating PDF for ${user.email}...`);
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    let dateRangeString = "yesterday";
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (start.toDateString() === end.toDateString()) {
            dateRangeString = `on ${start.toLocaleDateString(undefined, options)}`;
        } else {
            dateRangeString = `from ${start.toLocaleDateString(undefined, options)} to ${end.toLocaleDateString(undefined, options)}`;
        }
    }

    // We create HTML content dynamically. You could also use a templating engine like EJS or Handlebars.
    const htmlContent = `
        <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
                    h1, h2, h3 { color: #2c3e50; }
                    h1 { font-size: 28px; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                    .summary, .analysis, .questions { margin-bottom: 30px; }
                    .analysis { background-color: #e8f4fd; border-left: 5px solid #3498db; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
                    ul { list-style-type: none; padding-left: 0; }
                    li { background-color: #f9f9f9; border: 1px solid #eee; padding: 10px; margin-bottom: 8px; border-radius: 4px; }
                </style>
            </head>
            <body>
                <h1>Daily Progress Report for ${user.name}</h1>
                <div class="summary">
                    <h2>Hi ${user.name}, here's your summary for ${dateRangeString}!</h2>
                    <p>Total questions solved: <strong>${data.totalSolved}</strong></p>
                </div>
                <div class="analysis">
                    ${analysisHtml}
                </div>
                <div class="questions">
                    <h2>Solved Questions:</h2>
                    <ul>
                        ${data.questions.map(q => `<li><strong>${q.title}</strong> (${q.platform})</li>`).join('')}
                    </ul>
                </div>
            </body>
        </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    console.log(`PDF generated for ${user.email}.`);
    return pdfBuffer;
};

// --- Email Service ---

/**
 * Sends an email with a PDF attachment using Nodemailer.
 * @param {object} user - The user to email.
 * @param {Buffer} pdfBuffer - The PDF to attach.
 */
const sendEmail = async (user, pdfBuffer) => {
    console.log(`Preparing to send email to ${user.email}...`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: Email credentials (EMAIL_USER, EMAIL_PASS) are not set in the environment variables. Skipping email.');
        console.error('Please check your .env file.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or your preferred email provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"GrindLog Daily Digest" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Daily Question Summary!',
        html: `<p>Hi ${user.name},</p><p>Your daily progress report is attached. Keep up the great work!</p>`,
        attachments: [{
            filename: `daily-summary-${new Date().toISOString().split('T')[0]}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
    }
};

/**
 * Sends a motivational email if no problems were solved.
 * @param {object} user - The user to email.
 */
const sendMotivationalEmail = async (user) => {
    console.log(`Preparing to send motivational email to ${user.email}...`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: Email credentials (EMAIL_USER, EMAIL_PASS) are not set in the environment variables. Skipping email.');
        console.error('Please check your .env file.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"GrindLog Daily Digest" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'A little motivation for your coding journey! 💪',
        html: `<p>Hi ${user.name},</p><p>We noticed you didn't log any problems yesterday. Consistency is key to success! Why not try solving just one problem today to get back on track?</p><p>Keep grinding!</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Motivational email sent successfully to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send motivational email to ${user.email}:`, error);
    }
};

// --- Main Job & Scheduler ---

const hasRunToday = async () => {
    try {
        const lastRunDateString = await fs.readFile(LAST_RUN_FILE, 'utf-8');
        const today = new Date();
        const lastRunDate = new Date(lastRunDateString);
        return lastRunDate.toDateString() === today.toDateString();
    } catch (error) {
        if (error.code === 'ENOENT') return false; // File doesn't exist, so it hasn't run
        throw error;
    }
};

const runDailyDigest = async (options = {}) => {
    const { startDate, endDate } = options;
    const isManualTrigger = !!(startDate && endDate);

    console.log(`Starting digest job. Manual Trigger: ${isManualTrigger}, Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`);
    const users = await getAllActiveUsers();

    if (!users || users.length === 0) {
        console.log('No users to process. Job finished.');
        return;
    }

    for (const user of users) {
        try {
            const solvedData = await getSolvedDataForUser(user, { startDate, endDate });
            if (solvedData && solvedData.totalSolved > 0) {
                const analysisHtml = await analyzeSolvedProblems(solvedData.questions, { startDate, endDate });
                const pdfBuffer = await generatePdfReport(user, solvedData, analysisHtml, { startDate, endDate });
                await sendEmail(user, pdfBuffer);
            } else {
                // Only send motivational email on the automatic daily run if no problems were solved.
                if (!isManualTrigger) {
                    console.log(`No problems solved by ${user.email} yesterday. Sending a motivational email.`);
                    await sendMotivationalEmail(user);
                } else {
                    console.log(`No problems solved by ${user.email} in the selected timeframe. No email sent.`);
                }
            }
        } catch (error) {
            console.error(`Error processing digest for user ${user.email}:`, error);
        }
    }
    await fs.writeFile(LAST_RUN_FILE, new Date().toISOString());
    console.log('Daily digest job finished.');
};

const initializeDailyDigestService = () => {
    // Schedule to run every day at 8:00 AM.
    cron.schedule('0 8 * * *', runDailyDigest, { timezone: "America/New_York" });
    console.log('Daily digest service scheduled to run every day at 8:00 AM.');

    // To meet the "run as soon as the app starts" requirement, we check if it has run today.
    (async () => {
        if (!(await hasRunToday())) {
            console.log('Initial run: Daily digest has not run today. Starting now...');
            await runDailyDigest();
        } else {
            console.log('Initial check: Daily digest has already run today. Skipping.');
        }
    })();
};

module.exports = { initializeDailyDigestService, runDailyDigest };
