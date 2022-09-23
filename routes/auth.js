const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    const newUser = new User({ username, password: hashedPass });
    const user = await newUser.save();
    res.json({
      statusCode: 200,
      status: 'Success',
      message: user,
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      status: 'Server Error',
      message: 'Server Error',
    });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find the data by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        status: 'Unauthorized',
        message: 'Wrong Credential',
      });
    }

    // Chestatus: 'Success',ck whether password is correct or not
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({
        statusCode: 401,
        status: 'Unauthorized',
        message: 'Wrong Credential',
      });
    }

    // Create and assign a token
    const token = jwt.sign({ name: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    // console.log(token);

    let options = {
      path: '/',
      sameSite: true,
      maxAge: 1000 * 60 * 60 * 24, // would expire after 24 hours
      httpOnly: true, // The cookie only accessible by the web server
    };

    // res.cookie('x-access-token', token, options);
    // res.json({
    //   statusCode: 200,
    //   status: 'Success',
    //   message: {
    //     id: user._id,
    //     username: user.username,
    //     createdAt: user.createdAt,
    //     updatedAt: user.updatedAt,
    //     token,
    //   },
    // });
    res.redirect('/barcode');
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      status: 'Server Error',
      message: 'Server Error',
    });
  }
});

module.exports = router;