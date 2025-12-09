const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const cookies = req.cookies;

  if (!cookies.token) {
    return res.send(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.send(401).json({ error: "Token invalido." });
  }
};
