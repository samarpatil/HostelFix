const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const app = require('./src/app');

async function start() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`HostelFix API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

start();
