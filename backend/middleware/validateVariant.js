const validateVariant = (req, res, next) => {
  const { rsid, gene, chrom, ref, alt } = req.body;

  if (!rsid || typeof rsid !== 'string') {
    return res.status(400).json({ success: false, message: 'rsid is required' });
  }

  if (!gene || typeof gene !== 'string') {
    return res.status(400).json({ success: false, message: 'gene is required' });
  }

  if (!chrom) {
    return res.status(400).json({ success: false, message: 'chrom is required' });
  }

  if (!ref || !alt) {
    return res.status(400).json({ success: false, message: 'ref and alt alleles are required' });
  }

  next();
};

module.exports = validateVariant;