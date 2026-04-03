const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

function safeJoin(base, reqPath) {
  const rel = decodeURIComponent(reqPath.replace(/^\/+/, ''));
  const full = path.resolve(base, rel);
  const br = path.resolve(base);
  const relative = path.relative(br, full);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  const raw = req.url.split('?')[0];
  const reqPath = raw === '/' ? '/index.html' : raw;
  const filePath = safeJoin(publicDir, reqPath);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('找不到檔案');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3080;
server.listen(PORT, () => {
  console.log(`MBTI 測驗網站：http://localhost:${PORT}`);
});
