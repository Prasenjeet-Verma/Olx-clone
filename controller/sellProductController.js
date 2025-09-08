const User = require("../models/user");
const Car = require("../models/cars");
const Property = require("../models/properties");

// ---------------- CONTROLLERS ----------------

// ---------------- CATEGORIES ----------------
exports.getChooseCategory = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  res.render("chooseCategory", {
    pageTitle: "Choose Category",
    isLoggedIn: req.isLoggedIn,
    currentUser,
    currentPath: req.path,
  });
};

// ---------------- CARS ----------------
exports.getCarsform = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  res.render("cars", {
    pageTitle: "Cars",
    isLoggedIn: req.isLoggedIn,
    currentUser,
    currentPath: req.path,
  });
};

exports.postCarsform = async (req, res) => {
  try {
    if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) return res.redirect("/");

    // Validate required fields
    const { brand, year, fuel, transmission, kmDriven, adTitle, price, state, city } = req.body;
    if (!brand || !year || !fuel || !transmission || !kmDriven || !adTitle || !price || !state || !city) {
      return res.status(400).send("Please fill all required fields");
    }

    // ✅ Map uploaded photos from Cloudinary
    const photoPaths = req.files ? req.files.map(file => file.path) : [];

    // Create car
    const car = new Car({
      seller: currentUser._id,
      brand,
      model: req.body.model || "", // optional
      year,
      fuel,
      transmission,
      kmDriven,
      adTitle,
      price,
      state,
      city,
      photos: photoPaths,
    });

    await car.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    console.error("POST /cars error:", err); // <-- Full error log
    res.status(500).send("Database error");
  }
};

// ---------------- PROPERTIES ----------------
exports.getPropertiesform = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  res.render("properties", {
    pageTitle: "Properties",
    isLoggedIn: req.isLoggedIn,
    currentUser,
    currentPath: req.path,
  });
};

exports.postPropertyform = async (req, res) => {
  try {
    if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) return res.redirect("/");

    const { houseType, bhk, adTitle, price, state, city } = req.body;

    if (!houseType || !bhk || !adTitle || !price || !state || !city) {
      return res.status(400).send("Please fill all required fields");
    }

    // ✅ Map uploaded photos from Cloudinary
    const photoPaths = req.files ? req.files.map(file => file.path) : [];

    // Create property
    const property = new Property({
      seller: currentUser._id,
      houseType,
      bhk,
      bathrooms: req.body.bathrooms,
      furnishing: req.body.furnishing,
      projectStatus: req.body.projectStatus,
      listedBy: req.body.listedBy,
      totalFloors: req.body.totalFloors,
      adTitle,
      price,
      state,
      city,
      photos: photoPaths,
    });

    await property.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

// ---------------- OTHERS ----------------
exports.getAllCars = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");

  try {
    const cars = await Car.find().populate("seller", "username mobileno");
    res.render("carsmarket", {
      pageTitle: "All Cars",
      cars,
      isLoggedIn: req.isLoggedIn,
      currentPath: req.path,
      currentUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.getAllProperties = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  try {
    const properties = await Property.find().populate("seller", "username mobileno");
    res.render("propertiesmarket", {
      pageTitle: "All Properties",
      properties,
      isLoggedIn: req.isLoggedIn,
      currentPath: req.path,
      currentUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};


