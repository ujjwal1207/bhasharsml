const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');

/**
 * @route   GET /api/batches
 * @desc    Get maximum batch number
 * @access  Public
 */
router.get('/batches', voiceController.getMaxBatch);

/**
 * @route   GET /api/batch/:batch_id/files
 * @desc    Get maximum file number for a specific batch
 * @access  Public
 */
router.get('/batch/:batch_id/files', voiceController.getMaxFile);

/**
 * @route   GET /api/batch/:batch_id/file/:file_number
 * @desc    Get all segments for a specific batch and file
 * @access  Public
 */
router.get('/batch/:batch_id/file/:file_number', voiceController.getFile);

/**
 * @route   POST /api/batch/:batch_id/file/:file_number/save
 * @desc    Save RSML data for specific segments
 * @access  Public
 */
router.post('/batch/:batch_id/file/:file_number/save', voiceController.saveRsml);

module.exports = router;
