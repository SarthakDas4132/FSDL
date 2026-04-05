const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject
} = require('../controllers/projectController');

// 1. Import your new middleware
const { protect } = require('../middleware/authMiddleware');

// 2. Add 'protect' as the first argument to any route you want to lock down!
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject);

module.exports = router;