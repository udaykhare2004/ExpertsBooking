const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

exports.createBooking = async (req, res) => {
  try {
    const { expert, name, email, phone, date, timeSlot, notes } = req.body;

    if (!expert || !name || !email || !phone || !date || !timeSlot?.startTime || !timeSlot?.endTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const expertDoc = await Expert.findById(expert);
    if (!expertDoc) {
      return res.status(404).json({
        success: false,
        message: 'Expert not found'
      });
    }

    const existingBooking = await Booking.findOne({
      expert,
      date,
      'timeSlot.startTime': timeSlot.startTime,
      'timeSlot.endTime': timeSlot.endTime,
      status: { $in: ['Pending', 'Confirmed'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const booking = new Booking({
      expert,
      name,
      email: email.toLowerCase(),
      phone,
      date,
      timeSlot,
      notes: notes || ''
    });

    await booking.save();

    const expertSlot = expertDoc.availableSlots.find(slot => slot.date === date);
    if (expertSlot) {
      const timeSlotIndex = expertSlot.timeSlots.findIndex(
        ts => ts.startTime === timeSlot.startTime && ts.endTime === timeSlot.endTime
      );
      
      if (timeSlotIndex !== -1) {
        expertSlot.timeSlots[timeSlotIndex].isAvailable = false;
        expertSlot.timeSlots[timeSlotIndex].status = 'Pending';
        expertSlot.timeSlots[timeSlotIndex].bookingId = booking._id;
        expertDoc.markModified('availableSlots'); 
        await expertDoc.save();
      }
    }

    if (req.io) {
      req.io.to(`expert-${expert}`).emit('slotBooked', {
        expertId: expert,
        date,
        timeSlot
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This time slot is already booked' });
    }
    res.status(500).json({ success: false, message: 'Error creating booking', error: error.message });
  }
};

exports.getBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    console.log("request received to get bookings by email")
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const bookings = await Booking.find({ email: email.toLowerCase() })
      .populate('expert', 'name category rating') // Populates the expert object
      .sort({ createdAt: -1 });
    console.log(bookings)
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  console.log("request received to update booking status")
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('expert');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update Expert document to reflect status change
    const expertId = booking.expert._id || booking.expert;
    const expertDoc = await Expert.findById(expertId);

    if (expertDoc) {
      const expertSlot = expertDoc.availableSlots.find(slot => slot.date === booking.date);
      if (expertSlot) {
        const timeSlotIndex = expertSlot.timeSlots.findIndex(
          ts => ts.startTime === booking.timeSlot.startTime && ts.endTime === booking.timeSlot.endTime
        );

        if (timeSlotIndex !== -1) {
          if (status === 'Cancelled') {
            expertSlot.timeSlots[timeSlotIndex].isAvailable = true;
            expertSlot.timeSlots[timeSlotIndex].status = 'Available';
            expertSlot.timeSlots[timeSlotIndex].bookingId = null;
          } else {
            expertSlot.timeSlots[timeSlotIndex].status = status;
            expertSlot.timeSlots[timeSlotIndex].isAvailable = (status === 'Available');
          }
          expertDoc.markModified('availableSlots');
          await expertDoc.save();
        }
      }
    }    

    if (req.io) {
      if (status === 'Cancelled') {
      req.io.to(`expert-${expertId}`).emit('slotAvailable', {
      expertId: expertId,
      date: booking.date,
      timeSlot: booking.timeSlot
    });
    } else {
    req.io.to(`expert-${expertId}`).emit('slotStatusUpdated', {
      expertId: expertId,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: status
      });
    }
  }

  res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};