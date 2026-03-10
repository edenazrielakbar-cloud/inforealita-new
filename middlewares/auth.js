const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.id) {
    return next();
  }

  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
};

const redirectIfAuthenticated = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.id) {
    return res.redirect("/admin");
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.status(403).render("error", {
    message: "Akses ditolak. Hanya admin yang dapat mengakses halaman ini.",
    layout: "layouts/main",
  });
};

module.exports = {
  isAuthenticated,
  redirectIfAuthenticated,
  isAdmin,
};
