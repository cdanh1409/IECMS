const sql = require("mssql");

const config = {
  user: "iemsadmin",
  password: "123456",
  server: "KONGZANH",
  database: "IECMS",
  options: { encrypt: false, trustServerCertificate: true },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("✔ SQL Server connected!");
    return pool;
  })
  .catch((err) => console.error("❌ Connection error:", err));

module.exports = { sql, poolPromise };
