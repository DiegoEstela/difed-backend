const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "🚀 Backend de Difed funcionando correctamente!" });
});

module.exports = router;
