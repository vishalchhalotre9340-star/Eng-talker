import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/api.routes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Restrict CORS to a specific origin for better security
const corsOptions = {
  origin: 'https://app.amunet.ai',
  credentials: true, // Allows cookies to be sent
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Amunet AI Backend is running.');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});