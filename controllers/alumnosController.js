const db = require("../firebase");
const alumnosRef = db.collection("alumnos");

// Validadores auxiliares
function esNumeroControlValido(nc) {
  return typeof nc === "string" && /^\d{8}$/.test(nc);
}

function esEmailValido(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esEdadValida(edad) {
  return typeof edad === "number" && edad >= 17 && edad <= 30;
}

function esSemestreValido(semestre) {
  return typeof semestre === "number" && semestre >= 1 && semestre <= 12;
}

function esIdValido(id) {
  return typeof id === "string" && /^[a-zA-Z0-9]+$/.test(id);
}

// GET /alumnos
exports.obtenerAlumnos = async (req, res) => {
  const inicio = Date.now();
  try {
    const snapshot = await alumnosRef.get();
    const alumnos = [];
    snapshot.forEach(doc => alumnos.push({ id: doc.id, ...doc.data() }));

    const duracion = Date.now() - inicio;
    if (duracion > 2000) {
      console.warn("Consulta tardó más de 2 segundos");
    }
    res.status(200).json(alumnos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener alumnos" });
  }
};

// GET /alumnos/:id
exports.obtenerAlumnoPorId = async (req, res) => {
  const { id } = req.params;
  if (!esIdValido(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const doc = await alumnosRef.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Error al buscar alumno" });
  }
};

// POST /alumnos
exports.crearAlumno = async (req, res) => {
  const { id, numero_control, nombre, semestre, edad, email } = req.body;

  if (!id || !numero_control || !nombre || semestre == null || edad == null || !email) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (!esIdValido(id)) {
    return res.status(400).json({ error: "El ID debe ser alfanumérico" });
  }

  if (!esNumeroControlValido(numero_control)) {
    return res.status(400).json({ error: "El número de control debe tener exactamente 8 dígitos numéricos" });
  }

  if (!esEmailValido(email)) {
    return res.status(400).json({ error: "Formato de email inválido" });
  }

  if (!esEdadValida(edad)) {
    return res.status(400).json({ error: "Edad fuera de rango permitido (17–30)" });
  }

  if (!esSemestreValido(semestre)) {
    return res.status(400).json({ error: "Semestre fuera de rango permitido (1–12)" });
  }

  try {
    const docExistente = await alumnosRef.doc(id).get();
    if (docExistente.exists) {
      return res.status(409).json({ error: "Ya existe un alumno con este ID" });
    }

    const duplicado = await alumnosRef.where("numero_control", "==", numero_control).get();
    if (!duplicado.empty) {
      return res.status(409).json({ error: "El número de control ya está registrado" });
    }

    await alumnosRef.doc(id).set({ numero_control, nombre, semestre, edad, email });
    res.status(200).json({ id, numero_control, nombre, semestre, edad, email });
  } catch (error) {
    res.status(500).json({ error: "Error al crear alumno" });
  }
};

// PUT /alumnos/:id
exports.actualizarAlumno = async (req, res) => {
  const { id } = req.params;
  const { numero_control, nombre, semestre, edad, email } = req.body;

  if (!esIdValido(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (!numero_control || !nombre || semestre == null || edad == null || !email) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (!esNumeroControlValido(numero_control)) {
    return res.status(400).json({ error: "El número de control debe tener exactamente 8 dígitos numéricos" });
  }

  if (!esEmailValido(email)) {
    return res.status(400).json({ error: "Formato de email inválido" });
  }

  if (!esEdadValida(edad)) {
    return res.status(400).json({ error: "Edad fuera de rango permitido (17–30)" });
  }

  if (!esSemestreValido(semestre)) {
    return res.status(400).json({ error: "Semestre fuera de rango permitido (1–12)" });
  }

  try {
    const docRef = alumnosRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // Verificar conflicto con otro numero_control
    const duplicado = await alumnosRef.where("numero_control", "==", numero_control).get();
    if (!duplicado.empty && duplicado.docs[0].id !== id) {
      return res.status(409).json({ error: "El número de control ya está registrado por otro alumno" });
    }

    await docRef.update({ numero_control, nombre, semestre, edad, email });
    res.status(200).json({ id, numero_control, nombre, semestre, edad, email });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar alumno" });
  }
};

// DELETE /alumnos/:id
exports.eliminarAlumno = async (req, res) => {
  const { id } = req.params;
  if (!esIdValido(id)) {
    return res.status(400).json({ error: "ID en formato incorrecto" });
  }

  try {
    const docRef = alumnosRef.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    await docRef.delete();
    res.status(200).json({ mensaje: "Alumno eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar alumno" });
  }
};
