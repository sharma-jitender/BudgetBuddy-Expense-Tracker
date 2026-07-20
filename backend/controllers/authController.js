const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const escaped = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return User.findOne({ email: new RegExp(`^${escaped}$`, 'i') });
};

exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await findUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      profileImageUrl,
    });

    res.status(201).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};
exports.normalizeEmail = normalizeEmail;
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const normalizedEmail = normalizeEmail(email);
    const user = await findUserByEmail(normalizedEmail);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      id: user._id,
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res
    .status(500)
    .json({ message: 'Error logging in user', error: err.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user info', error: err.message });
  }
};