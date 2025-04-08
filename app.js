require('dotenv').config();
const express = require("express");
const app = express();

// Middlewares (sin CORS)
app.use(express.json());

// Rutas
const alumnosRoutes = require("./routes/alumnos");
const materiasRoutes = require("./routes/materiasRoutes");
const calificaciones = require("./routes/calificaciones");

app.use("/alumnos", alumnosRoutes);
app.use("/materias", materiasRoutes);
app.use("/calificaciones", calificaciones);

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});