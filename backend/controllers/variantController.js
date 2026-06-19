const Variant = require('../models/Variant');
const { escapeRegex } = require('../utils/escapeRegex');

const SEARCH_RESULT_LIMIT = 50;

// GET /api/variants
const getVariants = async (req, res, next) => {
  try {
    const { search, hasDrug, model } = req.query;

    const filter = {};

    if (search && String(search).trim()) {
      const term = escapeRegex(String(search).trim());
      filter.$or = [
        { rsid: { $regex: term, $options: 'i' } },
        { gene: { $regex: term, $options: 'i' } },
        { desc: { $regex: term, $options: 'i' } },
        { diseases: { $regex: term, $options: 'i' } },
      ];
    }

    if (hasDrug !== undefined) {
      filter.hasDrug = hasDrug === 'true';
    }

    if (model === 'pathnet') {
      filter.pathnetEligible = true;
    } else if (model === 'drugnet') {
      filter.drugnetEligible = true;
    }

    const variants = await Variant.find(filter)
      .sort({ rsid: 1 })
      .limit(SEARCH_RESULT_LIMIT)
      .select('-pathnetVector -drugnetVector');

    res.json({ success: true, count: variants.length, data: variants });
  } catch (error) {
    next(error);
  }
};

// GET /api/variants/:rsid
const getVariantByRsid = async (req, res, next) => {
  try {
    const variant = await Variant.findOne({ rsid: req.params.rsid }).select(
      '-pathnetVector -drugnetVector',
    );

    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    res.json({ success: true, data: variant });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVariants, getVariantByRsid };
