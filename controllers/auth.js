const crypto = require("crypto");
const { validationResult } = require("express-validator");

const bycrypt = require("bcryptjs");
const User = require("../models/user");

const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const mg = require("nodemailer-mailgun-transport");
const { error } = require("console");
const auth = {
  auth: {
    api_key: "36c8263012dd8724d75f7830fa0651ff-3750a53b-29fae47d",
    domain: "sandboxb8b99e9ef7e840ec81ce89baf6ab4365.mailgun.org",
  },
};
const transporter = nodemailer.createTransport(mg(auth));

exports.getLogin = (req, res, next) => {
  // const isLoggedIn =
  //   req.get("Cookie").split(";")[0].trim().split("=")[1] === "true";

  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    // retrieving it
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};
exports.postLogin = (req, res, next) => {
  // data is lost when we sent the response
  // req.isLoggedIn = true;
  // res.setHeader("Set-Cookie", "loggedIn=true");
  // the data is secured
  // User.findById("652670e0191d7d93987b2f0e").then((user) => {
  //   req.session.isLoggedIn = true;
  //   req.session.user = user;
  //   // watch for speed the session will take time before redirect so the view will not update
  //   req.session.save((err) => {
  //     console.log(err);
  //     res.redirect("/");
  //   });
  // });
  // the redirection creates a brand new request with no data

  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  console.log(errors.array());
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid email or password.",
        oldInput: { email: email, password: "" },
        validationErrors: errors.array(),
      });
    }
    const password = req.body.password;

    return bycrypt
      .compare(password, user.password)
      .then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          // watch for speed the session will take time before redirect so the view will not update
          return req.session.save((err) => {
            console.log(err);

            res.redirect("/");
          });
        }
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          oldInput: { email: email, password: password },
          validationErrors: errors.array(),
        });
      })
      .catch((err) => {
        req.flash("error", "invalid email or password.");
        res.redirect("/login");
      });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array()[0].path);
    res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bycrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter
        .sendMail({
          to: email,
          from: "shop@node-complete.com",
          subject: "Sign Up Succeded!",
          html: "<h1>You successfully signed up!</h1>",
        })
        .catch((err) => {
          console.log(err);
        });
    })

    .catch((err) => {});
};
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  // To generate a token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash("error", "No Account with that email");
        return res.redirect("/reset");
      }

      user.resetToken = token;
      user.resetTokenExp = Date.now() + 3600000;
      user.save().then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "shop@node-complete.com",
          subject: "Password Reset",
          html: `
            <p>You Requested a password reset</p>
            <p>Click this link <a href="http://localhost:3000/reset/${token}">to set a new password</a></p>`,
        });
      });
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } }).then(
    (user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    }
  );
};
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExp: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bycrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExp = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    });
};
