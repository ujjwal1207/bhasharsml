const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Voice = require('../models/Voice');
require('dotenv').config();

const CSV_FILE = 'indicvoices_rsml_ready.csv';

const importData = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bhasha_check';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await Voice.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const records = [];
    let count = 0;

    // Read CSV file
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        // Convert empty strings to appropriate defaults
        const record = {
          text: row.text || '',
          duration: parseFloat(row.duration) || 0,
          lang: row.lang || '',
          samples: parseInt(row.samples) || 0,
          verbatim: row.verbatim || '',
          normalized: row.normalized || '',
          speaker_id: row.speaker_id || '',
          scenario: row.scenario || '',
          task_name: row.task_name || '',
          gender: row.gender || '',
          age_group: row.age_group || '',
          job_type: row.job_type || '',
          qualification: row.qualification || '',
          area: row.area || '',
          district: row.district || '',
          state: row.state || '',
          occupation: row.occupation || '',
          verification_report: row.verification_report || '',
          unsanitized_verbatim: row.unsanitized_verbatim || '',
          unsanitized_normalized: row.unsanitized_normalized || '',
          file: row.file || '',
          segment: parseInt(row.segment) || 0,
          audio: row.audio || '',
          batch: row.batch || '',
          rsml: row.rsml || ''
        };

        records.push(record);
        count++;

        // Insert in batches of 1000
        if (records.length >= 1000) {
          Voice.insertMany(records)
            .then(() => {
              console.log(`✅ Inserted ${count} records...`);
            })
            .catch(err => {
              console.error('❌ Error inserting batch:', err);
            });
          records.length = 0; // Clear the array
        }
      })
      .on('end', async () => {
        // Insert remaining records
        if (records.length > 0) {
          await Voice.insertMany(records);
        }

        console.log(`\n✅ CSV import completed! Total records: ${count}`);
        
        // Create indexes
        await Voice.createIndexes();
        console.log('✅ Indexes created');

        process.exit(0);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        process.exit(1);
      });

  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  }
};

importData();
