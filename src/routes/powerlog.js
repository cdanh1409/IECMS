// routers/powerlog.js
const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../src/db");

// --- Lấy tất cả log ---
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM dbo.POWER_LOG");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Lấy log theo DEVICE_ID ---
router.get("/device/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("DEVICE_ID", sql.Int, deviceId)
      .query("SELECT * FROM dbo.POWER_LOG WHERE DEVICE_ID = @DEVICE_ID");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Thêm log mới ---
router.post("/", async (req, res) => {
  const { DEVICE_ID, POWER, VOLTAGE, AMPERAGE, CREATE_AT } = req.body;
  if (!DEVICE_ID || (!POWER && (!VOLTAGE || !AMPERAGE)))
    return res.status(400).json({ error: "Thiếu dữ liệu" });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("DEVICE_ID", sql.Int, DEVICE_ID)
      .input("POWER", sql.Float, POWER || null)
      .input("VOLTAGE", sql.Float, VOLTAGE || null)
      .input("AMPERAGE", sql.Float, AMPERAGE || null)
      .input("CREATE_AT", sql.DateTime, CREATE_AT || new Date()).query(`
        INSERT INTO dbo.POWER_LOG(DEVICE_ID, POWER, VOLTAGE, AMPERAGE, CREATE_AT)
        OUTPUT INSERTED.*
        VALUES (@DEVICE_ID, @POWER, @VOLTAGE, @AMPERAGE, @CREATE_AT)
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
