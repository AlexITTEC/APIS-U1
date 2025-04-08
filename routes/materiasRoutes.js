const express = require("express");
const router = express.Router();
const controller = require("../controllers/materiasController");

router.get("/", controller.obtenerMaterias);
router.get("/:id", controller.obtenerMateriaPorId);
router.post("/", controller.crearMateria);
router.put("/:id", controller.actualizarMateria);
router.delete("/:id", controller.eliminarMateria);

module.exports = router;