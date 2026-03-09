require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const numberRoutes = require('./numberRoutes');
const adminRoutes = require('./adminRoutes');
const providerRoutes = require('./providerRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ message: 'Virtual SMS SaaS backend is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/numbers', numberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/provider', providerRoutes);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
});
