const mongoose = require('mongoose');
const Voice = require('../models/Voice');
require('dotenv').config();

const checkData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bhasha_check';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected\n');

    // Check a sample record
    const sample = await Voice.findOne({}).lean();
    console.log('Sample record:', JSON.stringify(sample, null, 2));
    
    // Check distinct batches
    const batches = await Voice.distinct('batch');
    console.log('\nDistinct batches:', batches.slice(0, 10));
    console.log('Total batches:', batches.length);
    
    // Check batch 2 files
    const batch2Files = await Voice.distinct('file', { batch: '2' });
    console.log('\nFiles in batch 2:', batch2Files.slice(0, 10));
    console.log('Total files in batch 2:', batch2Files.length);
    
    // Check if batch 2 file 6 exists
    const batch2file6 = await Voice.findOne({ batch: '2', file: '6' }).lean();
    console.log('\nBatch 2 File 6 exists:', !!batch2file6);
    if (batch2file6) {
      console.log('Sample:', { batch: batch2file6.batch, file: batch2file6.file, segment: batch2file6.segment });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();
