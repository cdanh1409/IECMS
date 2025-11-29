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

// ----------------- LOGIN -----------------
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Thiếu username hoặc password" });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USERNAME", sql.NVarChar, username)
      .input("PASSWORD", sql.NVarChar, password).query(`
        SELECT USER_ID, USER_NAME, ROLE
        FROM ACCOUNT
        WHERE USER_NAME=@USERNAME AND PASSWORD=@PASSWORD
      `);

    if (result.recordset.length === 0)
      return res
        .status(401)
        .json({ error: "Username hoặc password không đúng" });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error login:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------- DEVICE ROUTES -----------------

// GET all devices by user
app.get("/api/devices/user/:USER_ID", async (req, res) => {
  const { USER_ID } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID)).query(`
        SELECT DEVICE_ID, DEVICE_NAME, ADDRESS, STATUS, USER_ID, kWh
        FROM DEVICE
        WHERE USER_ID=@USER_ID
        ORDER BY DEVICE_ID
      `);
    res.json(result.recordset || []);
  } catch (err) {
    console.error("❌ Error fetching devices by user:", err);
    res.status(500).json({ error: err.message });
  }
});

/// GET kWh thực tế theo device (fallback cho log đầu tiên)
app.get("/api/devices/user/:USER_ID/devices", async (req, res) => {
  const { USER_ID } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const pool = await poolPromise;

    // Lấy dữ liệu POWER_LOG với LAG() + fallback nếu prev_time = null
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID))
      .input("startDate", sql.DateTime, startDate ? new Date(startDate) : null)
      .input("endDate", sql.DateTime, endDate ? new Date(endDate) : null)
      .query(`
        WITH DevicePower AS (
          SELECT
            P.DEVICE_ID,
            D.DEVICE_NAME,
            P.CREATE_AT,
            P.POWER,
            LAG(P.CREATE_AT) OVER(PARTITION BY P.DEVICE_ID ORDER BY P.CREATE_AT) AS prev_time
          FROM POWER_LOG P
          JOIN DEVICE D ON P.DEVICE_ID = D.DEVICE_ID
          WHERE D.USER_ID = @USER_ID
            AND (@startDate IS NULL OR P.CREATE_AT >= @startDate)
            AND (@endDate IS NULL OR P.CREATE_AT <= @endDate)
        )
        SELECT
          CAST(CREATE_AT AS DATE) AS log_date,
          DEVICE_NAME,
          SUM(
            POWER * 
            CASE 
              WHEN prev_time IS NULL THEN 1.0 -- fallback: giả sử 1 giờ cho bản ghi đầu tiên
              ELSE DATEDIFF(SECOND, prev_time, CREATE_AT)/3600.0
            END
          ) / 1000.0 AS totalKWh
        FROM DevicePower
        GROUP BY CAST(CREATE_AT AS DATE), DEVICE_NAME
        ORDER BY log_date, DEVICE_NAME
      `);

    const data = result.recordset.map((r) => ({
      Date: r.log_date.toISOString().slice(0, 10),
      DEVICE_NAME: r.DEVICE_NAME,
      totalKWh: parseFloat(r.totalKWh.toFixed(3)), // giữ 3 chữ số thập phân
    }));

    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching device kWh:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST add new device
app.post("/api/devices", async (req, res) => {
  const { DEVICE_NAME, ADDRESS, STATUS, USER_ID, kWh } = req.body;
  if (!DEVICE_NAME || !ADDRESS || !STATUS || !USER_ID)
    return res.status(400).json({ error: "Thiếu dữ liệu" });

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

// PUT update device
app.put("/api/devices/:DEVICE_ID", async (req, res) => {
  const { DEVICE_ID } = req.params;
  const { kWh, STATUS, ADDRESS } = req.body;
  if (kWh === undefined || !STATUS || !ADDRESS)
    return res.status(400).json({ error: "Thiếu dữ liệu cập nhật" });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("DEVICE_ID", sql.Int, Number(DEVICE_ID))
      .input("KWH", sql.Float, Number(kWh))
      .input("STATUS", sql.NVarChar, STATUS)
      .input("ADDRESS", sql.NVarChar, ADDRESS).query(`
        UPDATE DEVICE
        SET kWh=@KWH, STATUS=@STATUS, ADDRESS=@ADDRESS
        WHERE DEVICE_ID=@DEVICE_ID;

        SELECT * FROM DEVICE WHERE DEVICE_ID=@DEVICE_ID;
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error updating device:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------- USER ROUTES -----------------

app.get("/api/user/:USER_ID", async (req, res) => {
  const { USER_ID } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID)).query(`
        SELECT TOP (1000) USER_ID, FULL_NAME, EMAIL, PHONE, ADDRESS, CREATED_AT, UPDATED_AT
        FROM USER_INFO
        WHERE USER_ID=@USER_ID
      `);
    if (result.recordset.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/user/:USER_ID", async (req, res) => {
  const { USER_ID } = req.params;
  const { FULL_NAME, EMAIL, PHONE, ADDRESS } = req.body;
  if (!FULL_NAME || !EMAIL || !PHONE || !ADDRESS)
    return res.status(400).json({ error: "Thiếu dữ liệu cập nhật" });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, Number(USER_ID))
      .input("FULL_NAME", sql.NVarChar, FULL_NAME)
      .input("EMAIL", sql.NVarChar, EMAIL)
      .input("PHONE", sql.NVarChar, PHONE)
      .input("ADDRESS", sql.NVarChar, ADDRESS).query(`
        UPDATE USER_INFO
        SET FULL_NAME=@FULL_NAME, EMAIL=@EMAIL, PHONE=@PHONE, ADDRESS=@ADDRESS, UPDATED_AT=GETDATE()
        WHERE USER_ID=@USER_ID;

        SELECT TOP (1000) * FROM USER_INFO WHERE USER_ID=@USER_ID
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------- POWER LOG ROUTES -----------------

app.get("/api/power-log/:USER_ID", async (req, res) => {
  const { USER_ID } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const pool = await poolPromise;

    let query = `
      SELECT LOG_ID, DEVICE_ID, LABEL_NAME, VOLTAGE, AMPERAGE, POWER, CREATE_AT
      FROM POWER_LOG
      WHERE DEVICE_ID IN (
        SELECT DEVICE_ID FROM DEVICE WHERE USER_ID=@USER_ID
      )
    `;

    if (startDate && endDate) {
      query += `
        AND CREATE_AT >= @startDate
        AND CREATE_AT <= @endDate
      `;
    }

    query += ` ORDER BY CREATE_AT ASC`;

    const request = pool.request().input("USER_ID", sql.Int, Number(USER_ID));

    if (startDate && endDate) {
      request
        .input("startDate", sql.DateTime, new Date(startDate))
        .input("endDate", sql.DateTime, new Date(endDate));
    }

    const result = await request.query(query);

    res.json(result.recordset || []);
  } catch (err) {
    console.error("❌ Error fetching power logs:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----- START SERVER -----
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
