const express = require("express");
const app = express();

// Middlewares
app.use(express.json());

// Rutas
const alumnosRoutes = require("./routes/alumnos");
app.use("/alumnos", alumnosRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
