// Minimal static server for the TaskFlow app (no dependencies).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'app');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, path.normalize(url));
  const inRoot = file.startsWith(ROOT);
  if (inRoot && url !== '/' && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'text/plain' });
    return fs.createReadStream(file).pipe(res);
  }
  // SPA fallback: /login, /tasks, /profile all serve index.html
  res.writeHead(200, { 'Content-Type': 'text/html' });
  fs.createReadStream(path.join(ROOT, 'index.html')).pipe(res);
}).listen(PORT, () => console.log(`TaskFlow running at http://localhost:${PORT}`));
