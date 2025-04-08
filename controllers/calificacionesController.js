const db = require("../firebase");
const alumnosRef = db.collection("alumnos");

function esCalificacionValida(valor) {
  return typeof valor === "number" && valor >= 0 && valor <= 100;
}

// POST /calificaciones/:alumnoId/:materiaId
exports.agregarCalificacion = async (req, res) => {
  const { alumnoId, materiaId } = req.params;
  const { calificacion } = req.body;

  if (!esCalificacionValida(calificacion)) {
    return res.status(400).json({ error: "Calificación inválida (0-100)" });
  }

  try {
    const alumnoDoc = await alumnosRef.doc(alumnoId).get();
    if (!alumnoDoc.exists) return res.status(404).json({ error: "Alumno no encontrado" });

    const alumno = alumnoDoc.data();
    const materias = alumno.materias || {};
    materias[materiaId] = calificacion;

    await alumnosRef.doc(alumnoId).update({ materias });
    res.status(200).json({ mensaje: "Calificación agregada", alumnoId, materiaId, calificacion });
  } catch (err) {
    res.status(500).json({ error: "Error al agregar calificación" });
  }
};

// GET /calificaciones/:alumnoId/:materiaId
exports.obtenerCalificacion = async (req, res) => {
  const { alumnoId, materiaId } = req.params;

  try {
    const alumnoDoc = await alumnosRef.doc(alumnoId).get();
    if (!alumnoDoc.exists) return res.status(404).json({ error: "Alumno no encontrado" });

    const calificacion = alumnoDoc.data().materias?.[materiaId];
    if (calificacion === undefined) {
      return res.status(404).json({ error: "No existe calificación para esta materia" });
    }

    res.status(200).json({ alumnoId, materiaId, calificacion });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener calificación" });
  }
};

// PUT /calificaciones/:alumnoId/:materiaId
exports.actualizarCalificacion = async (req, res) => {
  const { alumnoId, materiaId } = req.params;
  const { calificacion } = req.body;

  if (!esCalificacionValida(calificacion)) {
    return res.status(400).json({ error: "Calificación inválida (0-100)" });
  }

  try {
    const docRef = alumnosRef.doc(alumnoId);
    const alumnoDoc = await docRef.get();
    if (!alumnoDoc.exists) return res.status(404).json({ error: "Alumno no encontrado" });

    const materias = alumnoDoc.data().materias || {};
    if (!(materiaId in materias)) {
      return res.status(404).json({ error: "Calificación no encontrada para esta materia" });
    }

    materias[materiaId] = calificacion;
    await docRef.update({ materias });
    res.status(200).json({ mensaje: "Calificación actualizada", alumnoId, materiaId, calificacion });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar calificación" });
  }
};

// DELETE /calificaciones/:alumnoId/:materiaId
exports.eliminarCalificacion = async (req, res) => {
  const { alumnoId, materiaId } = req.params;

  try {
    const docRef = alumnosRef.doc(alumnoId);
    const alumnoDoc = await docRef.get();
    if (!alumnoDoc.exists) return res.status(404).json({ error: "Alumno no encontrado" });

    const materias = alumnoDoc.data().materias || {};
    if (!(materiaId in materias)) {
      return res.status(404).json({ error: "Calificación no encontrada para esta materia" });
    }

    delete materias[materiaId];
    await docRef.update({ materias });
    res.status(200).json({ mensaje: "Calificación eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar calificación" });
  }
};