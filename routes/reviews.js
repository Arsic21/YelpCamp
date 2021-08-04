const express = require("express");
const router = express.Router({ mergeParams: true });

//Function that cathces async errors
const catchAsync = require("../utils/catchAsync");

//Campground model
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

//require controller
const reviews = require("../controllers/reviews");

//Make a review route
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

//Delete a review and review ref from campground
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
