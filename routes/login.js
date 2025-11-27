// routes

const express = require("express");

const loginRouter = express.Router();

loginRouter.get("/", (req, res) => {
  if (req.session.user) return res.redirect("/home");
  res.redirect("/login");
});

loginRouter.get("/login", (req, res) => {
  res.render("login", { error: null, old: {}, user: {} });
});

loginRouter.post("/login", (req, res) => {
  const { nome, email, senha } = req.body;

  // Basic validation
  if (!email || !senha) {
    return res.status(400).render("login", {
      error: "Preencha email e senha.",
      old: { nome, email },
    });
  }

  // Demo auth: accept any non-empty password; set session
  req.session.user = {
    nome: nome || email.split("@")[0],
    email,
  };

  res.redirect("/home");
});

loginRouter.get("/home", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("home", { user: req.session.user });
});

loginRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

module.exports = loginRouter;
