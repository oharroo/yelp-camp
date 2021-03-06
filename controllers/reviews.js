const express = require('express');
const Campground = require('../models/campground');
const Review = require('../models/review');  //Joi schema NOT reviews schema


module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //inside the reviews array, it pulls the review with reviewId out. deleting the review within the campground database collection
    await Review.findByIdAndDelete(reviewId); //deleting the review in the reviews database collection
    req.flash('success', 'Succesfully deleted review!')
    res.redirect(`/campgrounds/${id}`);
}