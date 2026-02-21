const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - expert
 *               - name
 *               - email
 *               - phone
 *               - date
 *               - timeSlot
 *             properties:
 *               expert:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2024-06-01"
 *               timeSlot:
 *                 type: object
 *                 properties:
 *                   startTime:
 *                     type: string
 *                     example: "09:00"
 *                   endTime:
 *                     type: string
 *                     example: "10:00"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Expert not found
 *       409:
 *         description: Time slot already booked
 *       500:
 *         description: Internal server error
 *   get:
 *     summary: Get bookings by email
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer email (case-insensitive)
 *     responses:
 *       200:
 *         description: List of bookings sorted by most recent
 *       400:
 *         description: Email parameter is required
 *       500:
 *         description: Internal server error
 */
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getBookingsByEmail);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Confirmed, Completed, Cancelled]
 *                 description: Setting to Cancelled will free up the expert's time slot
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;