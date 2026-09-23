const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'torque_block_super_secret_jwt_key_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, companyName, password, addresses } = req.body;

    if (!name || !email || !phone || !companyName || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: name, email, phone, companyName, password.',
        data: null
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'A business customer with this email already exists.',
        data: null
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      companyName,
      passwordHash,
      addresses: addresses || []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          companyName: user.companyName,
          addresses: user.addresses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password.',
        data: null
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
        data: null
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
        data: null
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          companyName: user.companyName,
          addresses: user.addresses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully.',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};
