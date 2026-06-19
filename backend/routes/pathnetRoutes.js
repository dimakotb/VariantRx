const express = require('express');
const router = express.Router();
const { runPathNet } = require('../controllers/pathnetController');
const { validatePathNetPredict } = require('../middleware/validatePredict');

router.post('/pathnet', validatePathNetPredict, runPathNet);

module.exports = router;