const express = require("express");
const router = express.Router();
const controller = require("../controllers/calificacionesController");

// Rutas protegidas con API Key si es necesario
router.post("/:alumnoId/:materiaId", controller.agregarCalificacion);
router.get("/:alumnoId/:materiaId", controller.obtenerCalificacion);
router.put("/:alumnoId/:materiaId", controller.actualizarCalificacion);
router.delete("/:alumnoId/:materiaId", controller.eliminarCalificacion);

module.exports = router;
