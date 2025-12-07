const Problem = require('../models/Problem');
const { triggerBackup } = require('../services/backupService');

const addProblem = async (req, res) => {
  try {
    const { platform, title, url } = req.body;

    // Validate required fields
    if (!platform || !title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Platform, title, and URL are required'
      });
    }


    const problem = new Problem({
      platform,
      title,
      url
    });

    await problem.save();

    // Trigger backup asynchronously on next tick
    setImmediate(() => {
      triggerBackup().catch(err => console.error('Backup trigger failed:', err));
    });

    res.status(201).json({
      success: true,
      message: 'Problem added successfully',
      data: problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding problem',
      error: error.message
    });
  }
};

const getProblems = async (req, res) => {
  try {
    const { platform } = req.query;

    const filter = platform && platform !== 'all' ? { platform } : {};

    const problems = await Problem.find(filter)
      .sort({ timestamp: -1 })
      .lean();

    // Group problems by date
    const groupedProblems = problems.reduce((acc, problem) => {
      const date = new Date(problem.timestamp).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(problem);
      return acc;
    }, {});

    res.json({
      success: true,
      data: groupedProblems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching problems',
      error: error.message
    });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Trigger backup asynchronously on next tick
    setImmediate(() => {
      triggerBackup().catch(err => console.error('Backup trigger failed:', err));
    });

    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting problem',
      error: error.message
    });
  }
};

module.exports = {
  addProblem,
  getProblems,
  deleteProblem
};