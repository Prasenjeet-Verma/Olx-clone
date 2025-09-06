const User = require("../models/user");
const Car = require("../models/cars");
const Property = require("../models/properties");
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ---------------- MULTER SETUP ----------------
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const randomString = (length) => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, randomString(10) + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/png', 'image/jpg', 'image/jpeg'];
  cb(null, allowed.includes(file.mimetype));
};

// Multer middleware to use only in post route
const upload = multer({ storage, fileFilter }).single('profileImage');

// ---------------- CONTROLLERS ----------------
exports.getUserDashBoard = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");

  try {
    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) return res.redirect("/");

    // ✅ Fetch all required car fields
    const cars = await Car.find(
      {},
      "adTitle price photos year kmDriven createdAt state city"
    ).lean();

    // ✅ Fetch all required property fields
    const properties = await Property.find(
      {},
      "adTitle price photos createdAt state city bhk bathrooms houseType"
    ).lean();

    res.render("dashBoard", {
      pageTitle: "Dashboard",
      isLoggedIn: req.isLoggedIn,
      currentUser,
      currentPath: req.path,
      cars,
      properties,
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    res.status(500).send("Server Error");
  }
};


exports.getUserProfile = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  res.render("userProfile", { pageTitle: "User Profile", isLoggedIn: req.isLoggedIn, currentUser, currentPath: req.path });
};

exports.editUserProfile = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  res.render("editProfile", { pageTitle: "Edit Profile", isLoggedIn: req.isLoggedIn, currentUser, currentPath: req.path });
};

exports.postEditUserProfile = (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.status(401).send('Login required');

  upload(req, res, async (err) => {
    if (err) return res.status(500).send('Error uploading file.');

    const { username } = req.body;
    const userId = req.session.user._id;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send('User not found.');
    
      const updateData = { username };

      if (req.file) {
        // Delete old profile pic if not default
        if (user.profilePic && user.profilePic !== '/uploads/default.png') {
          const oldPath = path.join(__dirname, '..', user.profilePic.slice(1));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.profilePic = `/uploads/${req.file.filename}`;
      }

      await User.findByIdAndUpdate(userId, updateData, { new: true });
      res.redirect('/userprofile');
    } catch (error) {
      console.error(error);
      res.status(500).send('Database error.');
    }
  });
};

exports.getCarDetails = async (req, res) => {
  try {
    const carId = req.params.id;

    // Find car + populate seller
    const car = await Car.findById(carId)
      .populate("seller", "username mobileno profilePic createdAt")
      .lean();

    if (!car) {
      return res.status(404).send("Car not found");
    }

    res.render("carDetails", {
      pageTitle: car.adTitle,
      car,
      isLoggedIn: req.isLoggedIn,
      currentUser: req.session.user || null,
      currentPath: req.path   // ✅ FIX: pass currentPath
    });
  } catch (err) {
    console.error("Error fetching car details:", err);
    res.status(500).send("Server Error");
  }
};

exports.getPropertyDetails = async (req, res) => {
  try {
    const propertyId = req.params.id;

    // Find property + populate seller
    const property = await Property.findById(propertyId)
      .populate("seller", "username mobileno profilePic createdAt")
      .lean();

    if (!property) {
      return res.status(404).send("Property not found");
    }

    res.render("propertyDetails", {
      pageTitle: property.adTitle,
      property,
      isLoggedIn: req.isLoggedIn,
      currentUser: req.session.user || null,
      currentPath: req.path   // ✅ FIX: pass currentPath
    });
  } catch (err) {
    console.error("Error fetching property details:", err);
    res.status(500).send("Server Error");
  }
};



exports.getFavorites = async (req, res) => {
  try {
    if (!req.isLoggedIn && !req.session.user) return res.redirect("/");

    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) return res.redirect("/");

    // Collect IDs by type
    const carIds = currentUser.favorites
      .filter(f => f.itemType === "Car")
      .map(f => f.itemId);

    const propertyIds = currentUser.favorites
      .filter(f => f.itemType === "Property")
      .map(f => f.itemId);

    // ✅ Fetch cars with important fields
    const cars = await Car.find(
      { _id: { $in: carIds } },
      "adTitle price photos year kmDriven createdAt state city"
    ).lean();

    // ✅ Fetch properties with important fields
    const properties = await Property.find(
      { _id: { $in: propertyIds } },
      "adTitle price photos createdAt state city bhk bathrooms houseType"
    ).lean();

    // ✅ Merge into single array (with type)
    const favorites = [
      ...cars.map(c => ({ type: "Car", data: c })),
      ...properties.map(p => ({ type: "Property", data: p }))
    ];

    res.render("favorites", {
      pageTitle: "My Favorites",
      isLoggedIn: req.isLoggedIn,
      currentUser,
      currentPath: req.path,
      favorites
    });
  } catch (err) {
    console.error("❌ getFavorites error:", err);
    res.status(500).send("Database error");
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { id, type } = req.body; // frontend sends {id, type}
    const userId = req.session.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Not logged in" });

    const exists = user.favorites.find(
      fav => fav.itemId.toString() === id && fav.itemType === type
    );

    if (exists) {
      // remove from favorites
      user.favorites = user.favorites.filter(
        fav => !(fav.itemId.toString() === id && fav.itemType === type)
      );
      await user.save();
      return res.json({ isFavorite: false });
    } else {
      // add to favorites
      user.favorites.push({ itemId: id, itemType: type });
      await user.save();
      return res.json({ isFavorite: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMyAds = async (req, res) => {
  try {
    if (!req.isLoggedIn && !req.session.user) return res.redirect("/");

    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) return res.redirect("/");

    // ✅ Fetch only ads posted by this user
    const cars = await Car.find(
      { seller: currentUser._id },
      "adTitle price photos createdAt state city"
    ).lean();

    const properties = await Property.find(
      { seller: currentUser._id },
      "adTitle price photos createdAt state city"
    ).lean();

    // Merge both into one list
    const myAds = [
      ...cars.map(c => ({ type: "Car", data: c })),
      ...properties.map(p => ({ type: "Property", data: p }))
    ];

    res.render("userAds", {
      pageTitle: "My Ads",
      isLoggedIn: req.isLoggedIn,
      currentUser,
      currentPath: req.path,
      myAds
    });
  } catch (err) {
    console.error("❌ getMyAds error:", err);
    res.status(500).send("Server Error");
  }
};
