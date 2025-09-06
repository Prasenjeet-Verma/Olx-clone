const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');


exports.getUserSignup = (req, res, next) => {
  res.render('userSignup', {
    pageTitle: 'Signup', 
    isLoggedIn: false,
    currentPath: req.path,
    errors: [], 
    oldInput: {
      username: '',
      email: '',
      password: ''
    }
  });
};

exports.postUserSignup = [
    check("username")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 4 })
    .withMessage("Full name must be at least 4 characters long")
    .trim(),

 check("mobileno")
    .notEmpty()
    .withMessage("Mobile number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits long")
    .isNumeric()
    .withMessage("Mobile number must contain only numbers")
    .trim(),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .trim(),

    async (req, res, next) => {
      const errors = validationResult(req);
      const { username, mobileno, password } = req.body;

      if (!errors.isEmpty()) {
        return res.status(422).render('userSignup', {
          isLoggedIn: false,
          pageTitle: 'Signup',
          currentPath: req.path,
          errors: errors.array().map((error) => error.msg),
          oldInput: { username, mobileno, password }
        });
      }

      try {
        const existingUser = await User.findOne({ mobileno: mobileno });
        if (existingUser) {
          return res.status(422).render('userSignup', {
            isLoggedIn: false,
            pageTitle: 'Signup',
            currentPath: req.path,
            errors: ['Email already exists. Please use a different email.'],
            oldInput: { username, mobileno, password }
          });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
          username,
          mobileno,
          password: hashedPassword
        });

        await newUser.save();
        
console.log(newUser.createdAt); // full date-time
console.log(newUser.accountYear); // only year (e.g. 2025)
        res.redirect('/');
      } catch (err) {
        console.error(err);
        next(err);
      }
    }
]

exports.getUserLogin = (req, res, next) => {

  res.render('userLogin', {
    pageTitle: 'Login',
    isLoggedIn: false,
    currentPath: req.path,
    errors: [],
    oldInput: {
      mobileno: '',
      password: ''
    }
  });
};

exports.postUserLogin = [
  check("mobileno")
   .notEmpty()
    .withMessage("Mobile number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits long")
    .isNumeric()
    .withMessage("Mobile number must contain only numbers")
    .trim(),

  check("password")
    .notEmpty() 
    .withMessage("Password is required")
    .trim(),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { mobileno, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(422).render('userLogin', {
        isLoggedIn: false,
        pageTitle: 'Login',
        currentPath: req.path,
        errors: errors.array().map((error) => error.msg),
        oldInput: { mobileno, password }
      });
    };

    try {
      const user = await User.findOne({ mobileno: mobileno });
      if (!user) {
        return res.status(422).render('userLogin', {
          isLoggedIn: false,
          currentPath: req.path,
          pageTitle: 'Login',
          errors: ['Invalid mobile No or password.'],
          oldInput: { mobileno, password }
        });
      }

      const doMatch = await bcrypt.compare(password, user.password);
      if (!doMatch) {
        return res.status(422).render('userLogin', {
          isLoggedIn: false,
          pageTitle: 'Login',
          currentPath: req.path,
          errors: ['Invalid mobile No or password.'],
          oldInput: { mobileno, password }
        });
      }

      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save(err => {
        if (err) console.error(err);
        res.redirect(`/dashboard`); // Redirect to dashboard with user mobileno as query parameter
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  } 
];