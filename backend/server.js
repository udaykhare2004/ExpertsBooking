const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : ["http://localhost:5173", "http://localhost:5174"];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  maxPoolSize: 5
})
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.error("MongoDB Connection Failed:", err.message);
  process.exit(1);
});

const expertRoutes = require("./routes/expertRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

app.use("/api/experts", expertRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on("joinExpertRoom", (expertId) => {
    socket.join(`expert-${expertId}`);
    console.log(`Client ${socket.id} joined expert room: expert-${expertId}`);
  });

  socket.on("leaveExpertRoom", (expertId) => {
    socket.leave(`expert-${expertId}`);
    console.log(`Client ${socket.id} left expert room: expert-${expertId}`);
  });
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Expert Booking API',
      version: '1.0.0',
      description: 'API for managing experts and real-time bookings',
      contact: { name: 'Developer' },
      servers: [{ url: 'http://localhost:5000' }]
    },
  },

  apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});