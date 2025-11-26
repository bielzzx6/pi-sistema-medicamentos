module.exports = {

  showLogin(req, res) {
    res.render("login", { error: null, old: {} });
  },

  login(req, res) {
    const { nome, email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).render("login", {
        error: "Preencha email e senha.",
        old: { nome, email }
      });
    }

    req.session.user = {
      nome: nome || email.split("@")[0],
      email
    };

    return res.redirect("/home");
  },

  home(req, res) {
    if (!req.session.user) return res.redirect("/login");
    res.render("home", { user: req.session.user });
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.redirect("/login");
    });
  }
};
