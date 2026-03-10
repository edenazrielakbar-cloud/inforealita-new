const express = require("express");
const router = express.Router();
const beritaController = require("../controllers/beritaController");
const authController = require("../controllers/authController");
const {
  uploadThumbnail,
  uploadContentImage,
} = require("../middlewares/upload");
const {
  isAuthenticated,
  redirectIfAuthenticated,
} = require("../middlewares/auth");

// Routes publik
router.get("/", beritaController.getHomePage);
router.get("/berita/:slug", beritaController.getBeritaBySlug);
router.get("/kategori/:kategori", beritaController.getKategori);
router.get("/search", beritaController.searchBerita);

// Routes auth
router.get("/login", redirectIfAuthenticated, authController.getLogin);
router.post("/login", redirectIfAuthenticated, authController.postLogin);
router.get("/logout", authController.logout);

// Routes admin
router.get("/admin", isAuthenticated, beritaController.getAdminDashboard);
router.get("/admin/tambah", isAuthenticated, beritaController.getTambahBerita);
router.post(
  "/admin/tambah",
  isAuthenticated,
  uploadThumbnail.single("thumbnail"),
  beritaController.postTambahBerita,
);
router.post(
  "/admin/upload-image",
  isAuthenticated,
  uploadContentImage.single("image"),
  beritaController.uploadContentImage,
);
router.post(
  "/admin/delete/:id",
  isAuthenticated,
  beritaController.deleteBerita,
);

module.exports = router;
