// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require("./config/serviceAccountkey.json"); // Asegúrate de que esta ruta sea correcta

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;
