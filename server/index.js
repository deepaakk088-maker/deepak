import express from 'express';
import cors from 'cors';
import { startScheduler } from './scheduler.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.get('/health', (req, res) => {
    res.json({ status: 'Scheduler backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startScheduler();
});
