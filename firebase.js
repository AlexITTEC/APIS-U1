// firebase.js
const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_CONFIG_JSON) {
  // 🔐 En producción (Render): usar variable de entorno
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG_JSON);
  
  // 🛠️ Fix para claves con '\n' literales (Render)
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

} else {
  // 🧪 En desarrollo local: usar archivo físico
  serviceAccount = require("./config/serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;
