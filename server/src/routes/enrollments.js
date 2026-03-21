const express = require('express');
const router = express.Router();
const { enroll, getMyEnrollments, completeCourse } = require('../controllers/enrollmentController');
const authenticate = require('../middleware/auth');

router.post('/', authenticate, enroll);
router.get('/my', authenticate, getMyEnrollments);
router.put('/:courseId/complete', authenticate, completeCourse);

module.exports = router;
