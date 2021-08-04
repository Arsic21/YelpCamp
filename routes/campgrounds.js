const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

//Function that cathces async errors
const catchAsync = require("../utils/catchAsync");

//Campground and Review model
const Campground = require("../models/campground");
const Review = require("../models/review");
//authentication middleware
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
//require controllers
const campgrounds = require("../controllers/campgrounds");

//Basic CRUD for campgrounds
//routes for viewing all camps and creating a new camp
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array("image"), validateCampground, catchAsync(campgrounds.createCampground));

//Get route for making a new camp
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
  .delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

//Get route for editing a camp
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
