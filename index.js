if (process.env.NODE_ENV !== "production") {    //if we're not in production process (we're in development) then we can use variables from .env 
    require('dotenv').config();
}
// ex: console.log(process.env.SECRET)



const express = require('express');
const path = require('path'); //file path names
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); //engine to parse ejs instead of default one
const session = require('express-session'); //retains information from a user's session to the site. unlocked using a small cookie(secret)
const flash = require('connect-flash'); //flashes a small message one time only
const ExpressError = require('./utils/ExpressError'); //error catching with custom defined function
const methodOverride = require('method-override'); //used for PUT/PATCH/DELETE ROUTES
const passport = require('passport'); //authenticate users
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet'); //common security issues
const MongoDBStore = require('connect-mongo')(session); //store session data in mongo
const passportLocalMongoose = require('passport-local-mongoose');




const Campground = require('./models/campground'); //need to require campground-model file to pass through our res.renders
const Review = require('./models/review'); //need to require review-model file to pass through our res.renders


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { MongoStore } = require('connect-mongo');
 const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// 'mongodb://localhost:27017/yelp-camp' or DB_URL

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection; //shortening code. mongoose.connection.on
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate); //engine to parse ejs instead of default one
app.set('view engine', 'ejs');  //don't need to explicity type .ejs 
app.set('views', path.join(__dirname, 'views'));    //file path names

app.use(express.urlencoded({ extended: true })) //need this to parse req.body data
app.use(methodOverride('_method')) //query string. need this to use put/patch requests
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24*60*60 //seconds
});

store.on("error", function(e){
    console.log("Session store error", e)
})

const sessionConfig = { 
    store, store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //minor security thing that requires http only to see cookie
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //expires after a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy: false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //tells passport to use LocalStrategy to authenticate user

passport.serializeUser(User.serializeUser()); //how to keep a user IN a session from passport-local-mongoose
passport.deserializeUser(User.deserializeUser()); //how to get user OUT of a session from passport-local-mongoose


app.use((req, res, next) => {   //on every one of our route handlers, it will pass through res.locals.success/error
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'asdf@gmail.com', username: 'asdf' })
    const newUser = await User.register(user, 'asdf')
    res.send(newUser);
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);    //use prefix /campgrounds in campgrounds.js routes
app.use('/campgrounds/:id/reviews', reviewRoutes);   //use /campgrounds/:id/reviews prefix from reviews.js in routes folder


app.get('/', (req, res) => {
    res.render('home.ejs')
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) { err.message = 'Oh No, Something Went Wrong!' }
    res.status(statusCode).render('error', { err });
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})