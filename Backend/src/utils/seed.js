require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { seedProducts, seedUsers } = require('./seedData');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/torque_block_db';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Product.deleteMany({});
    await User.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});

    console.log('[Seed] Seeding 10 Tyre Products...');
    const createdProducts = await Product.insertMany(seedProducts);
    console.log(`[Seed] Successfully inserted ${createdProducts.length} tyre products.`);

    console.log('[Seed] Seeding B2B Dealer User...');
    for (const userData of seedUsers) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);

      await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        companyName: userData.companyName,
        passwordHash,
        addresses: userData.addresses
      });
    }
    console.log(`[Seed] Successfully created ${seedUsers.length} initial user.`);

    console.log('\n========================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('B2B Customer Login:');
    console.log('  Email:    dealer@torqueblock.com');
    console.log('  Password: password123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
