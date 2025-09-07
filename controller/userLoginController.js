const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// ---------------- SIGNUP ----------------
exports.getUserSignup = (req, res) => {
  res.render("userSignup", {
    pageTitle: "Signup",
    isLoggedIn: false,
    currentPath: req.path,
    errors: [],
    oldInput: {
      username: "",
      mobileno: "",
      password: ""
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
    .withMessage("Mobile number must contain only numbers"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  async (req, res, next) => {
    const errors = validationResult(req);
    const { username, mobileno, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(422).render("userSignup", {
        isLoggedIn: false,
        pageTitle: "Signup",
        currentPath: req.path,
        errors: errors.array().map((error) => error.msg),
        oldInput: { username, mobileno, password }
      });
    }

    try {
      const existingUser = await User.findOne({ mobileno });
      if (existingUser) {
        return res.status(422).render("userSignup", {
          isLoggedIn: false,
          pageTitle: "Signup",
          currentPath: req.path,
          errors: ["Mobile number already exists. Please use a different one."],
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

      // If you want accountYear → define it as a virtual in User schema
      console.log(newUser.createdAt); // full date-time
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
];

// ---------------- LOGIN ----------------
exports.getUserLogin = (req, res) => {
  res.render("userLogin", {
    pageTitle: "Login",
    isLoggedIn: false,
    currentPath: req.path,
    errors: [],
    oldInput: {
      mobileno: "",
      password: ""
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
    .withMessage("Mobile number must contain only numbers"),

  check("password")
    .notEmpty()
    .withMessage("Password is required"),

  async (req, res, next) => {
    const errors = validationResult(req);
    const { mobileno, password } = req.body;

    if (!errors.isEmpty()) {
      return res.status(422).render("userLogin", {
        isLoggedIn: false,
        pageTitle: "Login",
        currentPath: req.path,
        errors: errors.array().map((error) => error.msg),
        oldInput: { mobileno, password }
      });
    }

    try {
      const user = await User.findOne({ mobileno });
      if (!user) {
        return res.status(422).render("userLogin", {
          isLoggedIn: false,
          currentPath: req.path,
          pageTitle: "Login",
          errors: ["Invalid mobile number or password."],
          oldInput: { mobileno, password }
        });
      }

      const doMatch = await bcrypt.compare(password, user.password);
      if (!doMatch) {
        return res.status(422).render("userLogin", {
          isLoggedIn: false,
          pageTitle: "Login",
          currentPath: req.path,
          errors: ["Invalid mobile number or password."],
          oldInput: { mobileno, password }
        });
      }

      req.session.isLoggedIn = true;
      req.session.user = user;

      req.session.save((err) => {
        if (err) console.error(err);
        res.redirect("/dashboard");
        // If you want mobileno in query: res.redirect(`/dashboard?mobileno=${mobileno}`);
      });
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
];
