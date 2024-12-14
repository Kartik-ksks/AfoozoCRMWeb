const express = require('express');
const uuid = require('uuid'); // To generate unique transaction IDs
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// In-memory storage for payments
const payments = {};

// Helper function to simulate payment processing
const simulatePaymentProcessing = () => {
    return Math.random() > 0.2; // 80% chance of success
};

// Route to create a payment
app.post('/api/payments/create', (req, res) => {
    const { amount, currency, description } = req.body;

    if (!amount || !currency || !description) {
        return res.status(400).json({ error: 'Amount, currency, and description are required.' });
    }

    const paymentId = uuid.v4();
    payments[paymentId] = {
        id: paymentId,
        amount,
        currency,
        description,
        status: 'created',
        timestamp: new Date().toISOString(),
    };

    res.status(201).json({ message: 'Payment created successfully.', paymentId });
});

// Route to process a payment
app.post('/api/payments/process/:id', (req, res) => {
    const { id } = req.params;
    const payment = payments[id];

    if (!payment) {
        return res.status(404).json({ error: 'Payment not found.' });
    }

    if (payment.status !== 'created') {
        return res.status(400).json({ error: 'Payment is not in a processable state.' });
    }

    const success = simulatePaymentProcessing();

    payment.status = success ? 'success' : 'failed';
    payment.processedTimestamp = new Date().toISOString();

    res.status(200).json({
        message: success ? 'Payment processed successfully.' : 'Payment failed.',
        payment,
    });
});

// Route to check payment status
app.get('/api/payments/status/:id', (req, res) => {
    const { id } = req.params;
    const payment = payments[id];

    if (!payment) {
        return res.status(404).json({ error: 'Payment not found.' });
    }

    res.status(200).json({ payment });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Payment Gateway API running on http://localhost:${PORT}`));
