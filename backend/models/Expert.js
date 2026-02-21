const mongoose = require('mongoose');

const expertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Expert name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  specialization: {
    type: [String],
    default: []
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  languages: {
    type: [String],
    default: ['English']
  },
  consultationFee: {
    type: Number,
    default: 0
  },
  availableSlots: [{
    date: {
      type: String,
      required: true
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      isAvailable: {
        type: Boolean,
        default: true
      },
      status: {
        type: String,
        enum: ['Available', 'Pending', 'Confirmed', 'Completed', 'Booked'],
        default: 'Available'
      },
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
      }
    }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Expert', expertSchema);
