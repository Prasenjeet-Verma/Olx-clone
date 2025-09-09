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

// inside your controller file (replace existing postPropertyform)
exports.postPropertyform = async (req, res) => {
  try {
    if (!req.isLoggedIn && !req.session.user) return res.redirect("/");

    // Debug logs: show body + files
    console.log("== POST /postproperty received ==");
    console.log("req.body:", req.body);
    console.log("req.files:", Array.isArray(req.files) ? req.files.map(f => ({ originalname: f.originalname, path: f.path, size: f.size })) : req.files);

    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) {
      console.log("User not found in session:", req.session.user && req.session.user._id);
      return res.redirect("/");
    }

    // Required fields
    const { houseType, bhk, adTitle, price, state, city } = req.body;
    if (!houseType || !bhk || !adTitle || !price || !state || !city) {
      console.log("Validation failed: missing required field");
      return res.status(400).send("Please fill all required fields");
    }

    // Map uploaded files -> Cloudinary returned paths (multer-storage-cloudinary sets file.path)
    const photoPaths = Array.isArray(req.files) ? req.files.map(file => file.path || file.secure_url || file.url) : [];
    console.log("photoPaths:", photoPaths);

    // Build property object (coerce numbers)
    const propertyData = {
      seller: currentUser._id,
      houseType,
      bhk: Number(bhk),
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      furnishing: req.body.furnishing || undefined,
      projectStatus: req.body.projectStatus || undefined,
      listedBy: req.body.listedBy || undefined,
      totalFloors: req.body.totalFloors ? Number(req.body.totalFloors) : undefined,
      adTitle,
      price: Number(price),
      state,
      city,
      photos: photoPaths,
    };

    // Remove undefined fields (optional)
    Object.keys(propertyData).forEach(k => propertyData[k] === undefined && delete propertyData[k]);

    // Save
    const property = new Property(propertyData);
    await property.save();
    console.log("Property saved, id:", property._id);
    return res.redirect("/dashboard");
  } catch (err) {
    // More detailed error logging
    console.error("POST /postproperty - ERROR:", err);

    // Multer file-size or limit error handling
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).send("One of the uploaded files is too large. Max allowed size is 5MB.");
    }

    // Mongoose validation error: print details
    if (err && err.name === "ValidationError") {
      console.error("Mongoose validation errors:", err.errors);
      return res.status(400).send("Validation error: " + Object.values(err.errors).map(e => e.message).join(", "));
    }

    return res.status(500).send("Internal server error");
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


