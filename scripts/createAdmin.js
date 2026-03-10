const sequelize = require("../config/database");
const User = require("../models/User");

async function createAdmin() {
  try {
    const [user, created] = await User.findOrCreate({
      where: { username: "admin" },
      defaults: {
        username: "inforealita",
        password: "inforealita123",
        role: "admin",
      },
    });

    if (created) {
      console.log("✅ User admin berhasil dibuat!");
    } else {
      console.log("⚠️  User admin sudah ada");
    }

    console.log("📝 Username: admin");
    console.log("🔑 Password: admin123");
  } catch (error) {
    console.error("❌ Gagal membuat user admin:", error);
  } finally {
    await sequelize.close();
  }
}

createAdmin();
