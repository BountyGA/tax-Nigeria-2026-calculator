// server.js - Production Ready
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ==================== SECURITY MIDDLEWARE ====================
app.use(helmet()); // Security headers
app.use(cors({
    origin: ['https://ngtaxcalculator.online', 'https://www.ngtaxcalculator.online'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// ==================== ENVIRONMENT VARIABLES ====================
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!FLW_SECRET_KEY) {
    console.error('❌ FLW_SECRET_KEY is required!');
    process.exit(1);
}

// ==================== DATABASE CONFIG (Example with MongoDB) ====================
// Uncomment if you want to save donations to database
/*
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const donationSchema = new mongoose.Schema({
    amount: Number,
    currency: String,
    email: String,
    transactionId: String,
    status: String,
    metadata: Object,
    createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);
*/

// ==================== PAYMENT VERIFICATION ====================
app.post('/api/verify-payment', async (req, res) => {
    try {
        const { transaction_id } = req.body;
        
        if (!transaction_id) {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction ID is required' 
            });
        }
        
        // Verify with Flutterwave
        const response = await axios.get(
            `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
            {
                headers: {
                    'Authorization': `Bearer ${FLW_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const paymentData = response.data.data;
        
        if (paymentData.status === "successful") {
            // Save to database (optional)
            /*
            await Donation.create({
                amount: paymentData.amount,
                currency: paymentData.currency,
                email: paymentData.customer.email,
                transactionId: paymentData.id,
                status: paymentData.status,
                metadata: {
                    tx_ref: paymentData.tx_ref,
                    payment_type: paymentData.payment_type,
                    customer: paymentData.customer
                }
            });
            */
            
            // Log successful verification
            console.log('✅ Payment verified:', {
                transactionId: paymentData.id,
                amount: paymentData.amount,
                email: paymentData.customer.email
            });
            
            return res.json({ 
                success: true, 
                data: paymentData,
                message: 'Payment verified successfully'
            });
        } else {
            return res.json({ 
                success: false, 
                error: 'Payment verification failed',
                status: paymentData.status 
            });
        }
    } catch (error) {
        console.error('❌ Payment verification error:', error.response?.data || error.message);
        
        return res.status(500).json({ 
            success: false, 
            error: 'Payment verification failed',
            details: error.response?.data || error.message 
        });
    }
});

// ==================== WEBHOOK HANDLER ====================
app.post('/api/webhook/flutterwave', async (req, res) => {
    try {
        const signature = req.headers['verif-hash'];
        const secretHash = process.env.FLW_WEBHOOK_SECRET;
        
        // Verify webhook signature
        if (!signature || signature !== secretHash) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const event = req.body;
        
        // Handle different event types
        switch (event.event) {
            case 'charge.completed':
                console.log('💰 Charge completed:', event.data);
                // Update your database, send emails, etc.
                break;
                
            case 'transfer.completed':
                console.log('💸 Transfer completed:', event.data);
                break;
                
            default:
                console.log('📦 Webhook event:', event.event);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV 
    });
});

// ==================== ERROR HANDLING ====================
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('🔥 Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? err.message : undefined 
    });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`🔐 Using Flutterwave ${FLW_SECRET_KEY.startsWith('FLWSECK_TEST') ? 'TEST' : 'LIVE'} key`);
});
