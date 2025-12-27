// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Payment verification endpoint
app.post('/verify-payment', async (req, res) => {
    const { transaction_id } = req.body;
    
    try {
        const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`
            }
        });
        
        if (response.data.status === "success") {
            // Payment is verified, update your database
            res.json({ success: true, data: response.data });
        } else {
            res.json({ success: false, error: 'Payment verification failed' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
