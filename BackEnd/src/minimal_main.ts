import 'dotenv/config';
import express from 'express';
import { logger } from './Utils/logger.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();
app.get('/', (req, res) => res.send('OK'));

app.listen(8001, () => {
  console.log('✅ Minimal server started');
});
