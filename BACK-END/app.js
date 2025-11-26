// Importações
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");

// Rotas
const loginRoutes = require("./routes/login");
const usuariosRoutes = require("./routes/usuarios");

// Inicialização do app
const app = express();

// Configuração da View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares globais
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "troque-por-uma-chave-secreta",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60, // 1 hora
    }
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Usando as Rotas
app.use("/", loginRoutes);
app.use("/usuarios", usuariosRoutes);

// Exportação (server.js inicia)
module.exports = app;
