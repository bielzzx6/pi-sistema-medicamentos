const path = require("path");
const pkg = require(path.join(__dirname, "..", "..", "package.json"));
const jwt = require("jsonwebtoken");

async function getVersion(req, res) {
  try {
    res.json({ version: pkg.version || "0.0.0" });
  } catch (err) {
    res.status(500).json({ error: "Não foi possível obter a versão." });
  }
}

async function verifyAuth(req, res) {
  const cookies = req.cookies;

  try {
    jwt.verify(cookies.token, process.env.JWT_SECRET);
    res.json({ success: true });
  } catch (error) {
    res.send(401).json({ error: "Token invalido." });
  }
}

module.exports = { getVersion, verifyAuth };
