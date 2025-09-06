const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config(); // <-- load .env variables

const rootDir = require('./utils/pathUtils');
const userLoginRouter = require('./routes/userLoginRoutes');
const dashboardRouter = require('./routes/dashBoardRoutes');
const sellRouter = require('./routes/sellroutes');

// ---------------- EXPRESS APP ----------------
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

// ---------------- SESSION STORE ----------------
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,   // from .env
  collection: 'sessions'
});
store.on('error', console.log);

app.use(session({
  secret: process.env.SESSION_SECRET || 'mysecret',  // from .env
  resave: false,
  saveUninitialized: false,
  store: store
}));

// ---------------- PARSERS ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- CUSTOM MIDDLEWARE ----------------
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

// ---------------- STATIC ----------------
app.use(express.static(path.join(rootDir, 'public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------- ROUTES ----------------
app.use(userLoginRouter);
app.use(dashboardRouter);
app.use(sellRouter);

// ---------------- DATABASE + SERVER ----------------
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log('❌ Database connection error:', err));
