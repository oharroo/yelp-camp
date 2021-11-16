const { campgroundSchema, reviewSchema } = require('./schemas.js');  //Joi schema NOT campgrounds schema
const ExpressError = require('./utils/ExpressError'); //error catching with custom defined function
const Campground = require('./models/campground'); //need to require campground-model file to pass through our res.renders
const Review = require('./models/review'); //need to require campground-model file to pass through our res.renders


module.exports.isLoggedIn = (req, res, next) => {
    //console.log("REQ.USER...", req.user);
    if (!req.isAuthenticated()) {
        //store the url they are requesting
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in first');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')   //maps over each element and joins them together in a single string
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`campground/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;    //grab reviewId from the query/url string
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`campground/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',') //maps over each element and joins them together in a single string
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}