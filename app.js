const express = require('express');
const app = express();
const port = 3000;

// Ruta básica
app.get('/', (req, res) => {
  res.send('¡Hola Mundo!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});