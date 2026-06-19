const Report = require('../models/Report');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
  try {
    const {
      patientName,
      patientId,
      rsid,
      gene,
      variantType,
      chromosome,
      alleleChange,
      pathnetResult,
      drugnetResult,
      reviewerNotes,
    } = req.body;

    const report = await Report.create({
      user: req.user.id,
      patientName,
      patientId,
      rsid,
      gene,
      variantType,
      chromosome,
      alleleChange,
      pathnetResult,
      drugnetResult,
      reviewerNotes,
    });

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports for authenticated user
// @route   GET /api/reports
// @access  Private
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check ownership
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a report (e.g. reviewer notes)
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res, next) => {
  try {
    let report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check ownership
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this report' });
    }

    report = await Report.findByIdAndUpdate(
      req.params.id,
      { reviewerNotes: req.body.reviewerNotes, patientName: req.body.patientName, patientId: req.body.patientId },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check ownership
    if (report.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this report' });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
};
