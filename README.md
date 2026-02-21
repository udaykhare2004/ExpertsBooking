# Expert Booking System

A full-stack expert booking application with real-time slot updates, double booking prevention, and comprehensive booking management as required by the assignment.

## Features

### Frontend
1. **Expert Listing Screen**
   - Displays experts with names, category, experience, and rating
   - Search by names
   - Filter by categorys
   - Pagination is present
   - Loading and error states are handled

2. **Expert Detail Screen**
   - Show expert details in a sleek manner
   - Display available time slots grouped by date
   - Realtime slot updates via Socket.io are done

3. **Booking Screen**
   - Form fields: Name, Email, Phone, Date, Time Slot, Notes
   - Form validation
   - Success message after booking through using toast
   - Disabled booked slots, ensuring race conditions don't occur

4. **My Bookings Screen**
   - View bookings by email
   - Display booking status (Pending, Confirmed, Completed, Cancelled)

### Backend
- Proper folder structure (routes/controllers/models)
- RESTful API endpoints
- Realtime updates using Socket.io
- Double booking prevention with race condition handling
- Comprehensive error handling and validation

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time updates

### Frontend
- React
- React Router
- Tailwind CSS
- Socket.io Client
- Axios


### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expertBookingDB
FRONTEND_URL=http://localhost:5173
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Experts
- `GET /api/experts` - Get all experts (with pagination and filters)
  - Query params: `page`, `limit`, `search`, `category`
- `GET /api/experts/:id` - Get expert by ID
- `GET /api/experts/categories` - Get all categories

### Bookings
- `POST /api/bookings` - Create a new booking
  - Body: `{ expert, name, email, phone, date, timeSlot: { startTime, endTime }, notes }`
- `GET /api/bookings?email=xxx` - Get bookings by email
- `PATCH /api/bookings/:id/status` - Update booking status
  - Body: `{ status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' }`

## Key Features Implementation

### Double Booking Prevention
- Database-level unique index on `expert`, `date`, `timeSlot.startTime`, and `timeSlot.endTime`
- Transaction-based booking creation with session isolation
- Pre-booking validation check for existing bookings
- Race condition handling using MongoDB transactions

### Real-Time Updates
- Socket.io server integrated with Express
- Room-based updates (clients join expert-specific rooms)
- Real-time slot availability updates when bookings are made/cancelled
- Automatic UI updates without page refresh

### Error Handling
- Comprehensive validation middleware
- Meaningful error messages
- Proper HTTP status codes
- Error handling middleware for unhandled errors

## Project Structure

```
Assignment/
├── backend/
│   ├── models/
│   │   ├── Expert.js
│   │   └── Booking.js
│   ├── controllers/
│   │   ├── expertController.js
│   │   └── bookingController.js
│   ├── routes/
│   │   ├── expertRoutes.js
│   │   └── bookingRoutes.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── scripts/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ExpertList.jsx
│   │   │   ├── ExpertDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   └── MyBookings.jsx
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── context/
│   │   │   └── SocketContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Usage

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Browse experts, search/filter as needed
4. Click on an expert to view details and available slots
5. Select a time slot to book an appointment
6. Fill in the booking form and submit
7. View your bookings by entering your email in "My Bookings"

