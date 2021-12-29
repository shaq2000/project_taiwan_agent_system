const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const passport = require("passport");
const methodOverride = require("method-override");
const authRoute = require("./routes/auth-route");
require("./config/passport");
const profileRoute = require("./routes/profile-route");
const cookieSession = require("cookie-session");
const session = require("express-session");
const flash = require("connect-flash");

// middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose.set("useFindAndModify", false);

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connect to mongoDB atlas");
  })
  .catch((err) => {
    console.log("connection failed");
    console.log(err);
  });

app.get("/", (req, res) => {
  res.render("index.ejs", { user: req.user });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.render("error.ejs", { user: req.user });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
