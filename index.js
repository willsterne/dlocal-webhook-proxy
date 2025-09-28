const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Middleware to capture raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

const SUPABASE_WEBHOOK_URL = 'https://skzzxjcojcrdqvakjblz.supabase.co/functions/v1/dlocal-webhook-handler';

app.post('/webhook', async (req, res) => {
  console.log('🔔 Railway Proxy: Webhook received');
  console.log('📋 Headers:', req.headers);
  
  try {
    // Forward the exact request to Supabase
    const response = await fetch(SUPABASE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': req.headers['x-signature'],
        'X-Date': req.headers['x-date'],
        ...req.headers
      },
      body: req.body
    });
    
    const responseData = await response.text();
    console.log('✅ Forwarded to Supabase, status:', response.status);
    
    res.status(response.status).send(responseData);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Proxy forwarding failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'dlocal-webhook-proxy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 dLocal Webhook Proxy running on port ${PORT}`);
});
