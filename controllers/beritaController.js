const Berita = require("../models/Berita");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Halaman publik
exports.getHomePage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // 6 berita per halaman
    const offset = (page - 1) * limit;

    const { count, rows: berita } = await Berita.findAndCountAll({
      where: { status: "publish" },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("index", {
      title: "Portal Berita Hijau",
      berita: berita,
      currentPage: page,
      totalPages: totalPages,
      path: "/",
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getBeritaBySlug = async (req, res) => {
  try {
    const berita = await Berita.findOne({
      where: { slug: req.params.slug, status: "publish" },
    });

    if (!berita) {
      return res.status(404).render("error", {
        title: "Berita Tidak Ditemukan",
        message: "Berita tidak ditemukan",
      });
    }

    berita.views += 1;
    await berita.save();

    const beritaTerkait = await Berita.findAll({
      where: {
        kategori: berita.kategori,
        id: { [Op.ne]: berita.id },
        status: "publish",
      },
      limit: 3,
      order: [["createdAt", "DESC"]],
    });

    res.render("berita", {
      title: berita.judul,
      berita: berita,
      beritaTerkait: beritaTerkait,
      path: `/berita/${berita.slug}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getKategori = async (req, res) => {
  try {
    const kategori = req.params.kategori;
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // 6 berita per halaman
    const offset = (page - 1) * limit;

    const { count, rows: berita } = await Berita.findAndCountAll({
      where: {
        kategori: kategori,
        status: "publish",
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("kategori", {
      title: `Kategori: ${kategori}`,
      berita: berita,
      kategori: kategori,
      currentPage: page,
      totalPages: totalPages,
      path: `/kategori/${kategori}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.searchBerita = async (req, res) => {
  try {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // 6 berita per halaman
    const offset = (page - 1) * limit;

    const { count, rows: berita } = await Berita.findAndCountAll({
      where: {
        [Op.or]: [
          { judul: { [Op.like]: `%${query}%` } },
          { konten: { [Op.like]: `%${query}%` } },
        ],
        status: "publish",
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.render("search", {
      title: `Hasil Pencarian: ${query}`,
      berita: berita,
      query: query,
      currentPage: page,
      totalPages: totalPages,
      path: "/search",
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Admin controllers
exports.getAdminDashboard = async (req, res) => {
  try {
    const berita = await Berita.findAll({
      order: [["createdAt", "DESC"]],
    });

    const stats = {
      total: await Berita.count(),
      publish: await Berita.count({ where: { status: "publish" } }),
      draft: await Berita.count({ where: { status: "draft" } }),
    };

    res.render("admin/dashboard", {
      title: "Dashboard Admin",
      berita: berita,
      stats: stats,
      path: "/admin",
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.getTambahBerita = (req, res) => {
  res.render("admin/tambah", {
    title: "Tambah Berita",
    path: "/admin/tambah",
  });
};

exports.postTambahBerita = async (req, res) => {
  try {
    const { judul, kategori, konten, penulis, status } = req.body;
    const thumbnail = req.file
      ? `/uploads/thumbnails/${req.file.filename}`
      : null;

    await Berita.create({
      judul,
      kategori,
      konten,
      thumbnail,
      penulis,
      status,
    });

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

exports.uploadContentImage = (req, res) => {
  if (req.file) {
    res.json({
      success: 1,
      file: {
        url: `/uploads/images/${req.file.filename}`,
      },
    });
  } else {
    res.status(400).json({ success: 0, message: "Upload failed" });
  }
};

exports.deleteBerita = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);

    if (berita) {
      if (berita.thumbnail) {
        const filePath = path.join(__dirname, "../public", berita.thumbnail);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await berita.destroy();
    }
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Tampilkan form edit berita
exports.getEditBerita = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);

    if (!berita) {
      return res.status(404).render("error", {
        title: "Berita Tidak Ditemukan",
        message: "Berita tidak ditemukan",
        path: req.path,
      });
    }

    res.render("admin/edit", {
      title: "Edit Berita",
      berita: berita,
      path: `/admin/edit/${berita.id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};

// Proses update berita
exports.postEditBerita = async (req, res) => {
  try {
    const { judul, kategori, konten, penulis, status } = req.body;
    const berita = await Berita.findByPk(req.params.id);

    if (!berita) {
      return res.status(404).render("error", {
        title: "Berita Tidak Ditemukan",
        message: "Berita tidak ditemukan",
      });
    }

    // Update data
    berita.judul = judul;
    berita.kategori = kategori;
    berita.konten = konten;
    berita.penulis = penulis;
    berita.status = status;

    // Update thumbnail jika ada file baru
    if (req.file) {
      // Hapus thumbnail lama jika ada
      if (berita.thumbnail) {
        const oldThumbnailPath = path.join(
          __dirname,
          "../public",
          berita.thumbnail,
        );
        if (fs.existsSync(oldThumbnailPath)) {
          fs.unlinkSync(oldThumbnailPath);
        }
      }
      berita.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    await berita.save();

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      title: "Server Error",
      message: "Terjadi kesalahan pada server",
    });
  }
};
