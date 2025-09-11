const User = require("../models/user");
const Car = require("../models/cars");
const Property = require("../models/properties");
const { uploadSingle } = require("./multer"); // ✅ use reusable multer

// ---------------- CONTROLLERS ----------------

exports.getUserDashBoard = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");

  try {
    const currentUser = await User.findById(req.session.user._id);
    if (!currentUser) return res.redirect("/");

    const cars = await Car.find(
      {},
      "adTitle price photos year kmDriven createdAt state city"
    ).lean();

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
  res.render("userProfile", {
    pageTitle: "User Profile",
    isLoggedIn: req.isLoggedIn,
    currentUser,
    currentPath: req.path,
  });
};

exports.editUserProfile = async (req, res) => {
  if (!req.isLoggedIn && !req.session.user) return res.redirect("/");
  const currentUser = await User.findById(req.session.user._id);
  if (!currentUser) return res.redirect("/");
  res.render("editProfile", {
    pageTitle: "Edit Profile",
    isLoggedIn: req.isLoggedIn,
    currentUser,
    currentPath: req.path,
  });
};

// ---------------- POST Edit Profile ----------------
exports.postEditUserProfile = (req, res) => {
  if (!req.isLoggedIn && !req.session.user)
    return res.status(401).send("Login required");

  uploadSingle(req, res, async (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error:", err); // 🟢 Debug log
      return res.status(500).send("Error uploading file.");
    }

    const { username } = req.body;
    const userId = req.session.user._id;

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found.");

      const updateData = { username };

      if (req.file) {
        // Cloudinary URL is in req.file.path
        updateData.profilePic = req.file.path;
      }

      await User.findByIdAndUpdate(userId, updateData, { new: true });
      res.redirect("/userprofile");
    } catch (error) {
      console.error("Database Error:", error);
      res.status(500).send("Database error.");
    }
  });
};

exports.getCarDetails = async (req, res) => {
  try {
    const carId = req.params.id;

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
      currentPath: req.path,
    });
  } catch (err) {
    console.error("Error fetching car details:", err);
    res.status(500).send("Server Error");
  }
};

exports.getPropertyDetails = async (req, res) => {
  try {
    const propertyId = req.params.id;

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
      currentPath: req.path,
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

    const carIds = currentUser.favorites
      .filter((f) => f.itemType === "Car")
      .map((f) => f.itemId);

    const propertyIds = currentUser.favorites
      .filter((f) => f.itemType === "Property")
      .map((f) => f.itemId);

    const cars = await Car.find(
      { _id: { $in: carIds } },
      "adTitle price photos year kmDriven createdAt state city"
    ).lean();

    const properties = await Property.find(
      { _id: { $in: propertyIds } },
      "adTitle price photos createdAt state city bhk bathrooms houseType"
    ).lean();

    const favorites = [
      ...cars.map((c) => ({ type: "Car", data: c })),
      ...properties.map((p) => ({ type: "Property", data: p })),
    ];

    res.render("favorites", {
      pageTitle: "My Favorites",
      isLoggedIn: req.isLoggedIn,
      currentUser,
      currentPath: req.path,
      favorites,
    });
  } catch (err) {
    console.error("❌ getFavorites error:", err);
    res.status(500).send("Database error");
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { id, type } = req.body;
    const userId = req.session.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: "Not logged in" });

    const exists = user.favorites.find(
      (fav) => fav.itemId.toString() === id && fav.itemType === type
    );

    if (exists) {
      user.favorites = user.favorites.filter(
        (fav) => !(fav.itemId.toString() === id && fav.itemType === type)
      );
      await user.save();
      return res.json({ isFavorite: false });
    } else {
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

    const cars = await Car.find(
      { seller: currentUser._id },
      "adTitle price photos createdAt state city"
    ).lean();

    const properties = await Property.find(
      { seller: currentUser._id },
      "adTitle price photos createdAt state city"
    ).lean();

    const myAds = [
      ...cars.map((c) => ({ type: "Car", data: c })),
      ...properties.map((p) => ({ type: "Property", data: p })),
    ];

    res.render("userAds", {
      pageTitle: "My Ads",
      isLoggedIn: req.isLoggedIn,
      currentUser,
      currentPath: req.path,
      myAds,
    });
  } catch (err) {
    console.error("❌ getMyAds error:", err);
    res.status(500).send("Server Error");
  }
};
