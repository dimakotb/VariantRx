/** POST /api/predict/pathnet — catalog lookup by rsid */
const validatePathNetPredict = (req, res, next) => {
  const { rsid } = req.body;

  if (!rsid || typeof rsid !== 'string' || !rsid.trim()) {
    return res.status(400).json({ success: false, message: 'rsid is required' });
  }

  req.body.rsid = rsid.trim();
  next();
};

/** POST /api/predict/drugnet */
const validateDrugNetPredict = (req, res, next) => {
  const { rsid } = req.body;

  if (!rsid || typeof rsid !== 'string' || !rsid.trim()) {
    return res.status(400).json({ success: false, message: 'rsid is required' });
  }

  req.body.rsid = rsid.trim();
  req.body.useCpic = Boolean(req.body.useCpic);
  req.body.usePgkb = Boolean(req.body.usePgkb);
  next();
};

module.exports = {
  validatePathNetPredict,
  validateDrugNetPredict,
};
