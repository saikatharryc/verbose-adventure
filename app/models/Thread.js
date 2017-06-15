const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const threadSchema = new Schema({
  thread_id: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  internalDate: {
    type: Date,
    required: true,
  },
});

module.exports = threadSchema;
