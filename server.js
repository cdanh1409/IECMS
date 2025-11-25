const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server config
const dbConfig = {
  user: "iemsadmin",
  password: "123456",
  server: "KONGZANH",
  database: "IEMS",
  options: { encrypt: false, trustServerCertificate: true },
};

// Connect to SQL
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("✔ SQL Server connected!");
    return pool;
  })
  .catch((err) => console.error("❌ SQL connection error:", err));

// --- Routes ---

// Get all devices
app.get("/api/devices", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT DEVICE_ID, USER_ID, DEVICE_NAME, ADDRESS, STATUS, ISNULL(kWh,0) AS kWh, CONVERT(VARCHAR, CREATE_AT, 23) AS CREATE_AT FROM DEVICE`
      );
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get devices by USER_ID
app.get("/api/devices/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, userId)
      .query(
        `SELECT DEVICE_ID, USER_ID, DEVICE_NAME, ADDRESS, STATUS, ISNULL(kWh,0) AS kWh, CONVERT(VARCHAR, CREATE_AT, 23) AS CREATE_AT FROM DEVICE WHERE USER_ID = @USER_ID`
      );
    res.json(result.recordset || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add new device
app.post("/api/devices", async (req, res) => {
  const { DEVICE_NAME, ADDRESS, STATUS, USER_ID, kWh, CREATE_AT } = req.body;
  if (
    !DEVICE_NAME ||
    !USER_ID ||
    !ADDRESS ||
    !STATUS ||
    CREATE_AT === undefined
  ) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  try {
    const pool = await poolPromise;
    const insertQuery = `       INSERT INTO DEVICE (USER_ID, DEVICE_NAME, ADDRESS, STATUS, kWh, CREATE_AT)
      OUTPUT INSERTED.*
      VALUES (@USER_ID, @DEVICE_NAME, @ADDRESS, @STATUS, @kWh, @CREATE_AT)
    `;
    const request = pool.request();
    request.input("USER_ID", sql.Int, USER_ID);
    request.input("DEVICE_NAME", sql.NVarChar, DEVICE_NAME);
    request.input("ADDRESS", sql.NVarChar, ADDRESS);
    request.input("STATUS", sql.NVarChar, STATUS);
    request.input("kWh", sql.Float, kWh || 0);
    request.input("CREATE_AT", sql.Date, CREATE_AT);

    const result = await request.query(insertQuery);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Optional: health check
app.get("/", (req, res) => res.send("Server is running"));

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
