const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync'); //error catching with custom defined function
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');

const Campground = require('../models/campground'); //need to require campground-model file to pass through our res.renders
const { campgroundSchema } = require('../schemas');
const multer = require('multer');   //changes html form to enable uploading of image files
const { storage } = require('../cloudinary');   //from index.js in cloudinary folder
const upload = multer({ storage }); //images will now be uploaded to cloudinary's database


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))


router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))



module.exports = router;