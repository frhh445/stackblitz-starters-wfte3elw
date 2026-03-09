const express = require('express');
const { providerWebhook } = require('./providerController');

const router = express.Router();

router.post('/webhook', providerWebhook);

module.exports = router;
