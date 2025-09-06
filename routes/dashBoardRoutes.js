const express = require('express');
const userDashBoardRouter = express.Router();
const userDashBoardController = require('../controller/userDashBoardController');

userDashBoardRouter.get('/dashboard', userDashBoardController.getUserDashBoard);
userDashBoardRouter.get('/userprofile', userDashBoardController.getUserProfile);
userDashBoardRouter.get('/edituserprofile', userDashBoardController.editUserProfile);
userDashBoardRouter.post('/edituserprofile', userDashBoardController.postEditUserProfile);
userDashBoardRouter.post("/toggle", userDashBoardController.toggleFavorite);
userDashBoardRouter.get("/favorite", userDashBoardController.getFavorites);
userDashBoardRouter.get("/cars/:id", userDashBoardController.getCarDetails);
userDashBoardRouter.get("/properties/:id", userDashBoardController.getPropertyDetails);
userDashBoardRouter.get("/myads", userDashBoardController.getMyAds);

module.exports = userDashBoardRouter;