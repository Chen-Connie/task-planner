const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  datetime: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium"
  },
  completed: { 
    type: Boolean, 
    default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model("Task", taskSchema);
