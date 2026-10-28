const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

(async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`API sur le port ${port}`));
  } catch (err) {
    console.error('Échec du démarrage :', err.message);
    process.exit(1);
  }
})();