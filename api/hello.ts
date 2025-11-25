import express from 'express';
import roster from './roster.js';
import standings from './standings.js';
import standingsFull from './standingsFull.js';

const app = express();

// Simple health check
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'API is running' });
});

// Fantasy API endpoints
app.get('/api/roster', roster);
app.get('/api/standings', standings);
app.get('/api/standingsFull', standingsFull);

export default app;
