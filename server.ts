import express from 'express';
import { sendEmailHandler } from './api/send-email.js';

const app = express();
const PORT = 3001;

app.use(express.json({ limit: '2mb' }));

app.post('/api/send-email', sendEmailHandler);

app.listen(PORT, 'localhost', () => {
  console.log(`[NeoByte API] Email server → http://localhost:${PORT}`);
});
