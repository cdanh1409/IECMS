const express = require("express");
const router = express.Router();
const sql = require("mssql");

const dbConfig = {
  user: "iemsadmin",
  password: "123456",
  server: "KONGZANH",
  database: "IEMS",
  options: { encrypt: false, trustServerCertificate: true },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => pool)
  .catch((err) => console.log("DB connection error:", err));

// Lấy devices theo user + với power (nếu có)
router.get("/with-power/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const pool = await poolPromise;
    const devicesResult = await pool
      .request()
      .input("USER_ID", sql.Int, userId)
      .query(
        "SELECT DEVICE_ID, DEVICE_NAME, ADDRESS, STATUS, CREATE_AT FROM DEVICE WHERE USER_ID=@USER_ID"
      );

    res.json(devicesResult.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
