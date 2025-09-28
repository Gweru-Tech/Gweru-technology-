const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find().populate('business').limit(12);
    res.render('index', { 
      title: 'Gweru Technologies - Business Hub',
      products,
      user: req.session.userId ? await User.findById(req.session.userId) : null
    });
  } catch (error) {
    res.render('index', { 
      title: 'Gweru Technologies - Business Hub',
      products: [],
      user: null
    });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login - Gweru Technologies' });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register - Gweru Technologies' });
});

// Register POST
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.render('register', { 
        title: 'Register - Gweru Technologies',
        error: 'User already exists'
      });
    }
    
    const user = new User({ username, email, password, role });
    await user.save();
    
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    res.render('register', { 
      title: 'Register - Gweru Technologies',
      error: 'Registration failed'
    });
  }
});

// Login POST
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('login', { 
        title: 'Login - Gweru Technologies',
        error: 'Invalid credentials'
      });
    }
    
    req.session.userId = user._id;
    res.redirect('/dashboard');
  } catch (error) {
    res.render('login', { 
      title: 'Login - Gweru Technologies',
      error: 'Login failed'
    });
  }
});

// Dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const Business = require('../models/Business');
    const Product = require('../models/Product');
    
    let business = null;
    let products = [];
    
    if (req.user.role === 'business') {
      business = await Business.findOne({ owner: req.user._id });
      if (business) {
        products = await Product.find({ business: business._id });
      }
    }
    
    res.render('dashboard', { 
      title: 'Dashboard - Gweru Technologies',
      user: req.user,
      business,
      products
    });
  } catch (error) {
    res.render('dashboard', { 
      title: 'Dashboard - Gweru Technologies',
      user: req.user,
      business: null,
      products: []
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
