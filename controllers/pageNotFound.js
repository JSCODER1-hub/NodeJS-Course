exports.pageNotFound = (req, res, next) => {
  // must be absolute path
  // res.status(404).sendFile(__dirname, "views", "404.html");
  res.render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.page500 = (req, res, next) => {
  // must be absolute path
  // res.status(404).sendFile(__dirname, "views", "404.html");
  res.render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: "sdsdsd",
  });
};
