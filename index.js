
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./src/config/db'); // Ensure database connection
const authRoutes = require('./src/routes/authRoutes');
const trainerRoutes = require('./src/routes/trainerroute');
const trainerGetRoutes = require('./src/routes/trainerget');
const programRoutes = require('./src/routes/programRoutes'); // Import the new route
const membershipRoutes = require('./src/routes/membershipRoutes');
//const userProgramsRoute = require('./src/routes/workout_routes'); // Import the user programs route
//const programRoutes1 = require('./routes/programRoutes');
const fitnessTrackingRoutes = require('./src/routes/fitnessTrackingRoutes');


const { initializeFitnessTables } = require('./src/config/initDB');

dotenv.config();
const app = express();

// Enable CORS
app.use(cors());

// Middleware for JSON parsing
app.use(express.json());

// API Routes
app.use('/api', authRoutes);
app.use('/api', trainerRoutes);
app.use('/api', trainerGetRoutes);
app.use('/api', programRoutes); // Register program routes
app.use('/api/membership', membershipRoutes);
app.use('/api', fitnessTrackingRoutes);
//app.use('/api/user-programs', userProgramsRoute);
//app.use('/api', programRoutes1); // Register the new route

(async () => {
    try {
      await initializeFitnessTables();
      console.log('✅ Fitness tracking tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing fitness tracking tables:', error);
    }
  })();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
