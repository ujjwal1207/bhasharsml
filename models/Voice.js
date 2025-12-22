const mongoose = require('mongoose');

const voiceSchema = new mongoose.Schema({
  text: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 0
  },
  lang: {
    type: String,
    default: ''
  },
  samples: {
    type: Number,
    default: 0
  },
  verbatim: {
    type: String,
    default: ''
  },
  normalized: {
    type: String,
    default: ''
  },
  speaker_id: {
    type: String,
    default: ''
  },
  scenario: {
    type: String,
    default: ''
  },
  task_name: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  age_group: {
    type: String,
    default: ''
  },
  job_type: {
    type: String,
    default: ''
  },
  qualification: {
    type: String,
    default: ''
  },
  area: {
    type: String,
    default: ''
  },
  district: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
  verification_report: {
    type: String,
    default: ''
  },
  unsanitized_verbatim: {
    type: String,
    default: ''
  },
  unsanitized_normalized: {
    type: String,
    default: ''
  },
  file: {
    type: String,
    required: true,
    index: true
  },
  segment: {
    type: Number,
    required: true,
    index: true
  },
  audio: {
    type: String,
    default: ''
  },
  batch: {
    type: String,
    required: true,
    index: true
  },
  rsml: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
voiceSchema.index({ batch: 1, file: 1, segment: 1 });

const Voice = mongoose.model('Voice', voiceSchema);

module.exports = Voice;
