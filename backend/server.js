const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ----- SQL Server config -----
const dbConfig = {
  user: "iemsadmin",
  password: "123456",
  server: "KONGZANH",
  database: "IECMS",
  options: { encrypt: false, trustServerCertificate: true },
};

// ----- Connect to SQL Server -----
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("✔ SQL Server connected!");
    return pool;
  })
  .catch((err) => {
    console.error("❌ SQL connection error:", err);
    process.exit(1);
  });

// ----- ROUTES -----

// Health check
app.get("/", (req, res) => res.send("Server is running"));

// GET devices by user
app.get("/api/devices/user/:USER_ID", async (req, res) => {
  const { USER_ID } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID)).query(`
        SELECT 
          D.DEVICE_ID, 
          D.DEVICE_NAME, 
          D.ADDRESS, 
          D.STATUS, 
          D.USER_ID,
          D.kWh,
          ISNULL(SUM(P.POWER),0) AS totalPower
        FROM DEVICE D
        LEFT JOIN POWER_LOG P ON D.DEVICE_ID = P.DEVICE_ID
        WHERE D.USER_ID = @USER_ID
        GROUP BY D.DEVICE_ID, D.DEVICE_NAME, D.ADDRESS, D.STATUS, D.USER_ID, D.kWh
        ORDER BY D.DEVICE_ID
      `);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("❌ Error fetching devices by user:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/devices -> thêm device mới
app.post("/api/devices", async (req, res) => {
  const { DEVICE_NAME, ADDRESS, STATUS, USER_ID, kWh } = req.body;

  if (!DEVICE_NAME || !ADDRESS || !STATUS || !USER_ID) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID))
      .input("DEVICE_NAME", sql.NVarChar, DEVICE_NAME)
      .input("ADDRESS", sql.NVarChar, ADDRESS)
      .input("STATUS", sql.NVarChar, STATUS)
      .input("KWH", sql.Float, Number(kWh ?? 0)).query(`
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

// PUT /api/devices/:DEVICE_ID -> update kWh, Status, Address
app.put("/api/devices/:DEVICE_ID", async (req, res) => {
  const { DEVICE_ID } = req.params;
  const { kWh, STATUS, ADDRESS } = req.body;

  if (kWh === undefined || !STATUS || !ADDRESS) {
    return res.status(400).json({ error: "Thiếu dữ liệu cập nhật" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("DEVICE_ID", sql.Int, Number(DEVICE_ID))
      .input("KWH", sql.Float, Number(kWh))
      .input("STATUS", sql.NVarChar, STATUS)
      .input("ADDRESS", sql.NVarChar, ADDRESS).query(`
        UPDATE DEVICE
        SET kWh = @KWH, STATUS = @STATUS, ADDRESS = @ADDRESS
        WHERE DEVICE_ID = @DEVICE_ID;

        SELECT * FROM DEVICE WHERE DEVICE_ID = @DEVICE_ID;
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error updating device:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/devices/:DEVICE_ID -> xóa device
app.delete("/api/devices/:DEVICE_ID", async (req, res) => {
  const { DEVICE_ID } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("DEVICE_ID", sql.Int, Number(DEVICE_ID))
      .query("DELETE FROM DEVICE WHERE DEVICE_ID = @DEVICE_ID");

    res.json({ success: result.rowsAffected[0] > 0 });
  } catch (err) {
    console.error("❌ Error deleting device:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----- START SERVER -----
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
