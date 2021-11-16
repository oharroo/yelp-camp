const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');


const Review = require('../models/review');  //Joi schema NOT reviews schema
const Campground = require('../models/campground');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');


const catchAsync = require('../utils/catchAsync'); //error catching with custom defined function
const ExpressError = require('../utils/ExpressError'); //error catching with custom defined function




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));


module.exports = router;