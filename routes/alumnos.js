const express = require("express");
const router = express.Router();
const controller = require("../controllers/alumnosController");

router.get("/", controller.obtenerAlumnos);
router.get("/:id", controller.obtenerAlumnoPorId);
router.post("/", controller.crearAlumno);
router.put("/:id", controller.actualizarAlumno);
router.delete("/:id", controller.eliminarAlumno);

module.exports = router;
