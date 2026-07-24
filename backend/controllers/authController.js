const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const findUserByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  return prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        profileImageUrl,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      id: user.id,
      user: userWithoutPassword,
      token: generateToken(user.id),
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

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      id: user.id,
      user: userWithoutPassword,
      token: generateToken(user.id),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error logging in user', error: err.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user info', error: err.message });
  }
};