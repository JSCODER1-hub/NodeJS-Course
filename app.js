// fs For File system Package
// Http requests and responses
// Https requests and responses
// os operating system operations
const path = require("path");
const https = require("https");
const fs = require("fs");
// Import statments in js
// if you don't write ./ it will look for a global variable called http
// and if you put it it will look for js file
// const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
// const playground = require("./error-playgroud");
const pageNotFoundController = require("./controllers/pageNotFound");
// const mongoConnect = require("./util/database").mongoConnect;
const mongoose = require("mongoose");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// const MONGODB_URI = "mongodb://127.0.0.1:27017/shop";
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.0e8wfii.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a",
  }
);

// To secure Requests
app.use(helmet());
// To Compress Assets
app.use(compression());

//  WE Give it a log stream to save the log proccess
app.use(morgan("combined", { stream: accessLogStream }));

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
// storage engine
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + "-" + file.originalname);
//   },
// });

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype == "image/png" ||
//     file.mimetype == "image/jpg" ||
//     file.mimetype == "image/jpeg"
//   ) {
//     console.log("done");
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

const csrfProtection = csrf();
// for engine that is not built in the node
// the first parameter is the name you can choose anything
// but the name must match with the next statment
// app.engine(
//   "handlebars",
//   expressHbs({ layoutsDir: "views/layouts/", defaultLayout: "main-layout" })
// );
// app.set("view engine", "handlebars");

// sets the preffered engine
// app.set("view engine", "pug");
app.set("view engine", "ejs");

// sets views location
app.set("views", "views");

const adminRoutes = require("./routes/admin");

const authRoutes = require("./routes/auth");

const shopRoutes = require("./routes/shop");

const User = require("./models/user");

const flash = require("connect-flash");

// app.use((req, res, next) => {
//   console.log("In the Middleware");
//   //   To make it proceed to next middle ware
//   next();
// });

// db.execute("SELECT * FROM products ")
//   .then((result) => {
//     console.log(result[0])
//   })
//   .catch((err) => {
//     console.log(err)
//   })

// Automatic body parsing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
// we have to mention the route of serving
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// so we have csrfToken in every request
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
// To access the user from anywhere
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

// only ones that start with /admin
app.use("/admin", adminRoutes);
// // app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", pageNotFoundController.page500);

app.use(pageNotFoundController.pageNotFound);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500')

  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
  });
});

// look for the given function or Make anonymous function
// http.createServer(rqListener);

// // Possible Syntax
// http.createServer(function(req,res){

// });
//  Can be converted to app.listen
// const server = http.createServer(app);
// // to run the app write node app.js !!!!!!!!!!!

// // Now we need to listen for incoming requests
// // Default port 80
// server.listen(3000);
// mongoConnect(() => {
//   app.listen(3000);
// });

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("all good to go");

    // To use SSL
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log("sss");
  });
