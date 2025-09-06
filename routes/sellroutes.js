const express = require('express');
const sellRouter = express.Router();
const sellProductController = require('../controller/sellProductController');
const { uploadMultiple } = require('../controller/multer'); // import multer

sellRouter.get('/choosecategory', sellProductController.getChooseCategory);
sellRouter.get('/cars', sellProductController.getCarsform);
sellRouter.post('/cars', uploadMultiple, sellProductController.postCarsform); // <-- add multer here
sellRouter.get('/properties', sellProductController.getPropertiesform);
sellRouter.post('/postproperty', uploadMultiple, sellProductController.postPropertyform); // multer for properties
sellRouter.get('/carsonly', sellProductController.getAllCars);
sellRouter.get('/propertyonly', sellProductController.getAllProperties);

module.exports = sellRouter;
