const Voice = require('../models/Voice');

/**
 * Get maximum batch number
 */
exports.getMaxBatch = async (req, res) => {
  try {
    const result = await Voice.aggregate([
      {
        $group: {
          _id: null,
          maxBatch: { $max: { $toInt: '$batch' } }
        }
      }
    ]);

    if (!result || result.length === 0 || !result[0].maxBatch) {
      return res.status(404).json({ error: 'No batches found' });
    }

    res.json({
      max_batch: result[0].maxBatch
    });
  } catch (error) {
    console.error('Error in getMaxBatch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get maximum file number for a specific batch
 */
exports.getMaxFile = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const batch = await Voice.findOne({ batch: batch_id });
    
    if (!batch) {
      return res.status(404).json({ error: `Batch ${batch_id} not found` });
    }

    const result = await Voice.aggregate([
      {
        $match: { batch: batch_id }
      },
      {
        $group: {
          _id: null,
          maxFile: { $max: { $toInt: '$file' } }
        }
      }
    ]);

    if (!result || result.length === 0 || !result[0].maxFile) {
      return res.status(404).json({ error: `No files for batch ${batch_id}` });
    }

    res.json({
      max_file: result[0].maxFile
    });
  } catch (error) {
    console.error('Error in getMaxFile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all data for a specific batch and file
 */
exports.getFile = async (req, res) => {
  try {
    const { batch_id, file_number } = req.params;

    const data = await Voice.find({
      batch: batch_id,
      file: file_number
    })
    .sort({ segment: 1 })
    .lean();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data for given batch and file' });
    }

    // Convert null values to empty strings
    const cleanedData = data.map(item => {
      const cleaned = {};
      for (const [key, value] of Object.entries(item)) {
        cleaned[key] = value === null || value === undefined ? '' : value;
      }
      return cleaned;
    });

    res.json(cleanedData);
  } catch (error) {
    console.error('Error in getFile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Save RSML data for specific segments
 */
exports.saveRsml = async (req, res) => {
  try {
    const { batch_id, file_number } = req.params;
    const segments = req.body; // Array of { segment: number, rsml: string }

    if (!Array.isArray(segments)) {
      return res.status(400).json({ error: 'Request body must be an array of segments' });
    }

    // Validate all segments have required fields
    for (const seg of segments) {
      if (typeof seg.segment !== 'number' || typeof seg.rsml !== 'string') {
        return res.status(400).json({ 
          error: 'Each segment must have segment (number) and rsml (string)' 
        });
      }
    }

    // Check if any matching rows exist
    const count = await Voice.countDocuments({
      batch: batch_id,
      file: file_number
    });

    if (count === 0) {
      return res.status(404).json({ error: 'No matching rows found' });
    }

    // Update each segment
    let updatedCount = 0;
    for (const seg of segments) {
      const result = await Voice.updateMany(
        {
          batch: batch_id,
          file: file_number,
          segment: seg.segment
        },
        {
          $set: { rsml: seg.rsml }
        }
      );
      updatedCount += result.modifiedCount;
    }

    res.json({
      message: `RSML saved for batch ${batch_id}, file ${file_number}`,
      segments_updated: segments.length,
      documents_modified: updatedCount
    });
  } catch (error) {
    console.error('Error in saveRsml:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
