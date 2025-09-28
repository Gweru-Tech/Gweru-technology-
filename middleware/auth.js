const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }
    res.redirect('/login');
  } catch (error) {
    res.redirect('/login');
  }
};

const businessAuth = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'business') {
      return next();
    }
    res.status(403).json({ message: 'Business access required' });
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = { auth, businessAuth };
