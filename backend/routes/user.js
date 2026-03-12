const express = require('express');
const router = express.Router();
const { getUserPlanLimits } = require('../middleware/planLimits');
const auth = require('../middleware/auth');

// Get user plan limits 
router.get('/plan-limits', auth, getUserPlanLimits); // register middleware or mount routes 

module.exports = router;