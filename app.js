const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

// Rutas
const indexRouter = require("./src/routes/index");
const contractsRouter = require("./src/routes/contracts");

const app = express();

// Middlewares globales
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Rutas
app.use("/", indexRouter);
app.use("/contracts", contractsRouter);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

console.log("🚀 Backend difed-contratos v3 listo!");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
