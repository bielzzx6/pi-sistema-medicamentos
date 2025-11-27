// Importação dos pacotes

const loginRouter = require("./routes/login");

// Instância para o Express

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "troque-por-uma-chave-secreta",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 },
  })
);

// Confguração dos middlewares

// Importação das rotas
app.use(loginRouter);
// Execução do servidor
try {
  app.listen(PORT);
  console.log(`Running on http://locahost:${PORT}`);
} catch {
  console.log("Error servidor não pode ser iniciado.");
}
