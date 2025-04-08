const db = require("../firebase");
const materiasRef = db.collection("materias");

// Validadores auxiliares
function esIdMateriaValido(id) {
  return typeof id === "string" && /^[A-Z]{3}-\d{3}$/.test(id); // Ejemplo: "MAT-101"
}

function esNombreValido(nombre) {
  return typeof nombre === "string" && nombre.length >= 5 && nombre.length <= 100;
}

function esSemestreValido(semestre) {
  return typeof semestre === "number" && semestre >= 1 && semestre <= 9;
}

function esAlumnosValido(alumnos) {
  return typeof alumnos === "number" && alumnos >= 0;
}

// GET /materias
exports.obtenerMaterias = async (req, res) => {
  const inicio = Date.now();
  try {
    const snapshot = await materiasRef.get();
    const materias = [];
    snapshot.forEach(doc => materias.push({ id: doc.id, ...doc.data() }));

    const duracion = Date.now() - inicio;
    if (duracion > 2000) {
      console.warn("Consulta tardó más de 2 segundos");
    }
    res.status(200).json(materias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener materias" });
  }
};

// GET /materias/:id
exports.obtenerMateriaPorId = async (req, res) => {
  const { id } = req.params;
  if (!esIdMateriaValido(id)) {
    return res.status(400).json({ error: "ID de materia inválido. Formato: ABC-123" });
  }

  try {
    const doc = await materiasRef.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error al buscar materia" });
  }
};

// POST /materias
exports.crearMateria = async (req, res) => {
  const { id, nombre, semestre, alumnos_inscritos = 0 } = req.body;

  if (!id || !nombre || semestre == null) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (!esIdMateriaValido(id)) {
    return res.status(400).json({ error: "ID inválido. Formato: ABC-123" });
  }

  if (!esNombreValido(nombre)) {
    return res.status(400).json({ error: "Nombre debe tener entre 5 y 100 caracteres" });
  }

  if (!esSemestreValido(semestre)) {
    return res.status(400).json({ error: "Semestre fuera de rango permitido (1–9)" });
  }

  if (!esAlumnosValido(alumnos_inscritos)) {
    return res.status(400).json({ error: "Número de alumnos debe ser 0 o mayor" });
  }

  try {
    const docExistente = await materiasRef.doc(id).get();
    if (docExistente.exists) {
      return res.status(409).json({ error: "Ya existe una materia con este ID" });
    }

    const duplicado = await materiasRef.where("nombre", "==", nombre).get();
    if (!duplicado.empty) {
      return res.status(409).json({ error: "Ya existe una materia con este nombre" });
    }

    await materiasRef.doc(id).set({ nombre, semestre, alumnos_inscritos });
    res.status(201).json({ id, nombre, semestre, alumnos_inscritos });
  } catch (error) {
    res.status(500).json({ error: "Error al crear materia" });
  }
};

// PUT /materias/:id
exports.actualizarMateria = async (req, res) => {
  const { id } = req.params;
  const { nombre, semestre, alumnos_inscritos } = req.body;

  if (!esIdMateriaValido(id)) {
    return res.status(400).json({ error: "ID inválido. Formato: ABC-123" });
  }

  if (nombre && !esNombreValido(nombre)) {
    return res.status(400).json({ error: "Nombre debe tener entre 5 y 100 caracteres" });
  }

  if (semestre && !esSemestreValido(semestre)) {
    return res.status(400).json({ error: "Semestre fuera de rango permitido (1–9)" });
  }

  if (alumnos_inscritos && !esAlumnosValido(alumnos_inscritos)) {
    return res.status(400).json({ error: "Número de alumnos debe ser 0 o mayor" });
  }

  try {
    const docRef = materiasRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    // Verificar conflicto con otro nombre
    if (nombre) {
      const duplicado = await materiasRef.where("nombre", "==", nombre).get();
      if (!duplicado.empty && duplicado.docs[0].id !== id) {
        return res.status(409).json({ error: "Este nombre ya está registrado por otra materia" });
      }
    }

    const datosActualizados = { 
      ...(nombre && { nombre }),
      ...(semestre && { semestre }),
      ...(alumnos_inscritos !== undefined && { alumnos_inscritos })
    };

    await docRef.update(datosActualizados);
    res.status(200).json({ id, ...datosActualizados });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar materia" });
  }
};

// DELETE /materias/:id
exports.eliminarMateria = async (req, res) => {
  const { id } = req.params;
  if (!esIdMateriaValido(id)) {
    return res.status(400).json({ error: "ID en formato incorrecto. Formato: ABC-123" });
  }

  try {
    const docRef = materiasRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Materia no encontrada" });
    }

    await docRef.delete();
    res.status(200).json({ mensaje: "Materia eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar materia" });
  }
};