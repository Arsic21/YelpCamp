//running dotenv
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//Requireing mongoose and express
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
//require ejsmate engine
const ejsMate = require("ejs-mate");
//Require session
const session = require("express-session");
//Require flash
const flash = require("connect-flash");
//Custom error class
const ExpressError = require("./utils/ExpressError");
//Require method override to make patch/put/delete request
const methodOverride = require("method-override");
//Require passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
//requireing user model to use with passport
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
//require routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const helmet = require("helmet");

//Connecting mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

//Checking if mongoose is connected
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

//Setting ejsMate engine for ejs
app.engine("ejs", ejsMate);
//Setting view engine to ejs and linking views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//for parsing form bodies
app.use(express.urlencoded({ extended: true }));
//defining query string for method override
app.use(methodOverride("_method"));
//serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

//configuring session
const sessionConfig = {
  name: "session",
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://cdn.jsdelivr.net",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = ["https://api.mapbox.com/", "https://a.tiles.mapbox.com/", "https://b.tiles.mapbox.com/", "https://events.mapbox.com/"];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/arsic21/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//middleware for using passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware for accessing flash messages
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//routes for campgrounds and reviews
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

//send response for home page request
app.get("/", (req, res) => {
  res.render("home");
});

//Catches all requests, if last will only run if nothing before runs
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

//Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

//Listen on port 3000 for requests
app.listen(3000, () => {
  console.log("Serving on port 3000");
});
