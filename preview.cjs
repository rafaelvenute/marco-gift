// Anteprima locale: node preview.cjs
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  // Serve only the page and its public assets.
  if (!['index.html', 'style.css', 'script.js'].includes(relative) && !/^assets\/[\w.-]+$/.test(relative)) {
    res.writeHead(404).end(); return;
  }
  fs.readFile(path.join(__dirname, relative), (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(relative)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('Anteprima: http://127.0.0.1:4173'));
