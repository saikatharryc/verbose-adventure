const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const threadSchema = new Schema({
  thread_id: {
    type: String,
    required: true,
    unique : true,
  },
  message: {
    type: String,
  },
});

module.exports = threadSchema;
