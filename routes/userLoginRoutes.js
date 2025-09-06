const express = require('express');
const userLoginRouter = express.Router();
const userLoginController = require('../controller/userLoginController');

userLoginRouter.get('/', userLoginController.getUserLogin);
userLoginRouter.post('/userlogin', userLoginController.postUserLogin);
userLoginRouter.get('/usersignup', userLoginController.getUserSignup);
userLoginRouter.post('/usersignup', userLoginController.postUserSignup);

module.exports = userLoginRouter;