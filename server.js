require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { performAudit } = require('./src/audit');
const { sendAuditEmail } = require('./src/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get audit endpoint
app.post('/api/audit', async (req, res) => {
  try {
    const { businessName, city, state, email } = req.body;

    if (!businessName || !city) {
      return res.status(400).json({ error: 'Business name and city are required' });
    }

    const auditResults = await performAudit(businessName, city, state);

    // If email provided, send the audit
    if (email) {
      await sendAuditEmail(email, auditResults);
    }

    res.json({
      success: true,
      data: auditResults
    });

  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ 
      error: 'Failed to perform audit',
      message: error.message 
    });
  }
});

// Create Stripe checkout session
app.post('/api/create-checkout', async (req, res) => {
  try {
    const { email, businessName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Local SEO Monitoring - Monthly',
              description: 'Track your local search performance and get weekly reports',
            },
            unit_amount: 2900,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
      customer_email: email,
      metadata: {
        businessName: businessName
      }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe webhook handler
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
