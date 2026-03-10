const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const slugify = require("slugify");

const Berita = sequelize.define(
  "Berita",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    konten: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    penulis: {
      type: DataTypes.STRING,
      defaultValue: "Admin",
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("publish", "draft"),
      defaultValue: "publish",
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (berita) => {
        berita.slug = slugify(berita.judul, { lower: true, strict: true });
      },
      beforeUpdate: async (berita) => {
        if (berita.changed("judul")) {
          berita.slug = slugify(berita.judul, { lower: true, strict: true });
        }
      },
    },
  },
);

module.exports = Berita;
