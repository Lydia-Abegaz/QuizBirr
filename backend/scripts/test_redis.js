const { createClient } = require('redis');
const fs = require('fs');
const path = require('path');

function parseEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const out = {};
  for (const l of lines) {
    const m = l.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (m) {
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
  }
  return out;
}

(async () => {
  const envPath = path.resolve(__dirname, '..', '.env');
  const loaded = parseEnvFile(envPath);
  const url = process.env.REDIS_URL || loaded.REDIS_URL || 'redis://localhost:6379';

  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis client error', err.message || err));
  try {
    await client.connect();
    console.log('Connected to Redis at', url);
    const pong = await client.ping();
    console.log('PING ->', pong);
    await client.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message || err);
    try { await client.disconnect(); } catch(e){}
    process.exit(1);
  }
})();
