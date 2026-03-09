async function providerWebhook(req, res) {
  // This endpoint is intentionally simple and ready to be wired with external SMS providers.
  // Expected example payload: { activation_id, sender, message_text }
  return res.json({ message: 'Webhook received.', payload: req.body });
}

module.exports = { providerWebhook };
