import localtunnel from 'localtunnel';

let currentTunnel = null;

async function startTunnel() {
  try {
    const subdomain = 'rvcas-canteen-' + Math.random().toString(36).substring(2, 7);
    currentTunnel = await localtunnel({ port: 3005, subdomain });
    console.log('PUBLIC_TUNNEL_URL=' + currentTunnel.url);

    currentTunnel.on('close', () => {
      console.log('Tunnel closed, reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });

    currentTunnel.on('error', (err) => {
      console.error('Tunnel error:', err?.message || err);
      try { currentTunnel.close(); } catch(e) {}
      setTimeout(startTunnel, 3000);
    });
  } catch (err) {
    console.error('Failed to start tunnel, retrying in 3s:', err?.message || err);
    setTimeout(startTunnel, 3000);
  }
}

// Keep event loop alive
setInterval(() => {}, 1000 * 60 * 60);

startTunnel();
