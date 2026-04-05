const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String },
    value: { type: Number, default: 0 },          
    rate: { type: Number, default: 10 },          
    capacity: { type: Number, default: 100 },     
    overload_threshold: { type: Number, default: 80 }, 
    locked: { type: Boolean, default: false },
    overloaded: { type: Boolean, default: false }
  }
});

const EdgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  animated: { type: Boolean, default: true },
  style: {
    stroke: { type: String },
    strokeWidth: { type: Number }
  }
});

const ProjectSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // <-- THIS IS THE MISSING LINK!
  name: { type: String, required: true },
  description: { type: String },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);