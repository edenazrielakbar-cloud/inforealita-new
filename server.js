const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const methodOverride = require("method-override");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const sequelize = require("./config/database");
const beritaRoutes = require("./routes/beritaRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  }),
);

// Middleware untuk membuat session tersedia di semua view
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.session.user || null;
  next();
});

// EJS Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Routes
app.use("/", beritaRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("error", {
    message: "Halaman tidak ditemukan",
    path: req.path,
  });
});

// Database sync and server start
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
