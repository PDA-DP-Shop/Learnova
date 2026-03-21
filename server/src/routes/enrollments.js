const express = require('express');
const router = express.Router();
const { enroll, getMyEnrollments, completeCourse, updateTimeSpent } = require('../controllers/enrollmentController');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, enroll);
router.get('/my', authenticate, getMyEnrollments);
router.put('/:courseId/complete', authenticate, completeCourse);
router.put('/:courseId/time', authenticate, updateTimeSpent);

module.exports = router;
