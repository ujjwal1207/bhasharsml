const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const { protect } = require('../middleware/auth');

/**
 * @route   GET /api/batches/list
 * @desc    Get list of all available batches
 * @access  Private (requires authentication)
 */
router.get('/batches/list', protect, voiceController.getAllBatches);

/**
 * @route   GET /api/batch/:batch_id/files/list
 * @desc    Get list of all available files for a specific batch
 * @access  Private (requires authentication)
 */
router.get('/batch/:batch_id/files/list', protect, voiceController.getAllFiles);

/**
 * @route   GET /api/batches
 * @desc    Get maximum batch number
 * @access  Private (requires authentication)
 */
router.get('/batches', protect, voiceController.getMaxBatch);

/**
 * @route   GET /api/batch/:batch_id/files
 * @desc    Get maximum file number for a specific batch
 * @access  Private (requires authentication)
 */
router.get('/batch/:batch_id/files', protect, voiceController.getMaxFile);

/**
 * @route   GET /api/batch/:batch_id/file/:file_number
 * @desc    Get all segments for a specific batch and file
 * @access  Private (requires authentication)
 */
router.get('/batch/:batch_id/file/:file_number', protect, voiceController.getFile);

/**
 * @route   POST /api/batch/:batch_id/file/:file_number/save
 * @desc    Save RSML data for specific segments
 * @access  Private (requires authentication)
 */
router.post('/batch/:batch_id/file/:file_number/save', protect, voiceController.saveRsml);

module.exports = router;
