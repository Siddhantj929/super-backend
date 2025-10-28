import { connect as connectDB } from './src/database/index.js';
import server from './src/server/index.js';

const start = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await server.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
