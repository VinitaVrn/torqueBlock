const Razorpay = require('razorpay');

let razorpayInstance = null;

try {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_samplekey12345';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sample_secret_key_67890';

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
} catch (error) {
  console.warn('[Razorpay] Initialization error:', error.message);
}

module.exports = razorpayInstance;
