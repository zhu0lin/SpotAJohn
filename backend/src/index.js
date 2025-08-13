import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import locationsRouter from './routes/locations.js';
import nycLocationsRouter from './routes/nycLocations.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Spot-a-John Backend API' });
});

// Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// API routes
app.use('/api/locations', locationsRouter);
app.use('/api/nyc-locations', nycLocationsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 