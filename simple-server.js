
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>', 'utf-8');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${PORT}/`);
  console.log(`Local: http://localhost:${PORT}/`);
});
