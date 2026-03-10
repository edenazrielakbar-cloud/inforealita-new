const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    title: "Login Admin",
    layout: "layouts/auth",
    error: null,
    username: "",
    path: "/login",
  });
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.render("auth/login", {
        title: "Login Admin",
        layout: "layouts/auth",
        error: "Username atau password salah",
        username: username,
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.render("auth/login", {
        title: "Login Admin",
        layout: "layouts/auth",
        error: "Username atau password salah",
        username: username,
      });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
      res.redirect("/admin");
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).render("auth/login", {
      title: "Login Admin",
      layout: "layouts/auth",
      error: "Terjadi kesalahan server",
      username: req.body.username || "",
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.redirect("/login");
  });
};
