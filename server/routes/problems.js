const express = require('express');
const router = express.Router();
const { addProblem, getProblems, deleteProblem } = require('../controllers/problemController');

router.post('/', addProblem);
router.get('/', getProblems);
router.delete('/:id', deleteProblem);

module.exports = router;