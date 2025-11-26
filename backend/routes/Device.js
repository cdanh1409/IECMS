const express = require("express");
const sql = require("mssql");
const router = express.Router();

// Get all devices of a user
// Get all devices of a user with kWh from DEVICE and totalPower from POWER_LOG
router.get("/user/:USER_ID", async (req, res) => {
  try {
    const userId = Number(req.params.USER_ID);
    if (isNaN(userId))
      return res.status(400).json({ error: "Invalid USER_ID" });

    const pool = await sql.connect(dbConfig);
    const result = await pool.request().input("USER_ID", sql.Int, userId)
      .query(`
        SELECT 
          D.DEVICE_ID, 
          D.DEVICE_NAME, 
          D.ADDRESS, 
          D.STATUS, 
          D.USER_ID, 
          D.kWh, -- giá trị kWh đã lưu từ frontend
          ISNULL(SUM(P.POWER),0) AS totalPower -- tổng POWER_LOG nếu cần
        FROM DEVICE D
        LEFT JOIN POWER_LOG P ON D.DEVICE_ID = P.DEVICE_ID
        WHERE D.USER_ID = @USER_ID
        GROUP BY D.DEVICE_ID, D.DEVICE_NAME, D.ADDRESS, D.STATUS, D.USER_ID, D.kWh
        ORDER BY D.DEVICE_ID
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error fetching devices:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add new device
// routes/Device.js hoặc backend POST /api/devices
router.post("/", async (req, res) => {
  const { DEVICE_NAME, ADDRESS, STATUS, USER_ID, kWh } = req.body;
  if (!DEVICE_NAME || !ADDRESS || !STATUS || !USER_ID) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID))
      .input("DEVICE_NAME", sql.NVarChar, DEVICE_NAME)
      .input("ADDRESS", sql.NVarChar, ADDRESS)
      .input("STATUS", sql.NVarChar, STATUS)
      .input("KWH", sql.Float, Number(kWh || 0)) // nhận kWh từ frontend
      .query(`
        INSERT INTO DEVICE (USER_ID, DEVICE_NAME, ADDRESS, STATUS, kWh)
        OUTPUT INSERTED.*
        VALUES (@USER_ID, @DEVICE_NAME, @ADDRESS, @STATUS, @KWH)
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error inserting device:", err);
    res.status(500).json({ error: err.message });
  }
});
// Update device
router.put("/:DEVICE_ID", async (req, res) => {
  const { DEVICE_ID } = req.params;
  const { kWh, STATUS, ADDRESS } = req.body;

  if (kWh === undefined || !STATUS || !ADDRESS) {
    return res.status(400).json({ error: "Thiếu dữ liệu cập nhật" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("DEVICE_ID", sql.Int, Number(DEVICE_ID))
      .input("kWh", sql.Float, Number(kWh))
      .input("STATUS", sql.NVarChar, STATUS)
      .input("ADDRESS", sql.NVarChar, ADDRESS).query(`
        UPDATE DEVICE
        SET kWh = @kWh, STATUS = @STATUS, ADDRESS = @ADDRESS
        WHERE DEVICE_ID = @DEVICE_ID;

        SELECT * FROM DEVICE WHERE DEVICE_ID = @DEVICE_ID;
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error updating device:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
