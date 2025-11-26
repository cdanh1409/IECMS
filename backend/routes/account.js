// routers/account.js
const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../src/db");

// --- Lấy tất cả account ---
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM dbo.ACCOUNT");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Lấy account theo USER_ID ---
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, userId)
      .query("SELECT * FROM dbo.ACCOUNT WHERE USER_ID = @USER_ID");
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Thêm account mới ---
router.post("/", async (req, res) => {
  const { USER_ID, USERNAME, PASSWORD, ROLE } = req.body;
  if (!USER_ID || !USERNAME || !PASSWORD)
    return res.status(400).json({ error: "Thiếu dữ liệu" });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("USER_ID", sql.Int, USER_ID)
      .input("USERNAME", sql.NVarChar(100), USERNAME)
      .input("PASSWORD", sql.NVarChar(100), PASSWORD)
      .input("ROLE", sql.NVarChar(20), ROLE || "user").query(`
        INSERT INTO dbo.ACCOUNT(USER_ID, USERNAME, PASSWORD, ROLE)
        OUTPUT INSERTED.*
        VALUES (@USER_ID, @USERNAME, @PASSWORD, @ROLE)
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
