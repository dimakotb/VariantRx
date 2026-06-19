const express = require('express');
const router = express.Router();
const { getVariants, getVariantByRsid } = require('../controllers/variantController');

router.get('/', getVariants);
router.get('/:rsid', getVariantByRsid);

module.exports = router;