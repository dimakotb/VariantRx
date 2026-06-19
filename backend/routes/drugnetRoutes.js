const express = require('express');
const router = express.Router();
const { runDrugNet } = require('../controllers/drugnetController');
const { validateDrugNetPredict } = require('../middleware/validatePredict');

router.post('/drugnet', validateDrugNetPredict, runDrugNet);

module.exports = router;