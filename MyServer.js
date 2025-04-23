const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { initDataFile, readData, writeData } = require('./dataHandler');

initDataFile();

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => callback(JSON.parse(body || '{}')));
}

function handleResource(req, res, pathname, method, resourceType) {
  const data = readData();
  const array = data[resourceType];
  const id = parseInt(pathname.split('/')[2]);

  if (method === 'GET') {
    sendJSON(res, array);
  } else if (method === 'POST') {
    parseBody(req, body => {
      const newItem = { id: array.length + 1, ...body };
      array.push(newItem);
      data[resourceType] = array;
      writeData(data);
      sendJSON(res, array);
    });
  } else if (method === 'PUT') {
    parseBody(req, body => {
      const index = array.findIndex(item => item.id === id);
      if (index === -1) return sendJSON(res, { error: 'Item not found' }, 404);
      array[index] = { ...array[index], ...body };
      data[resourceType] = array;
      writeData(data);
      sendJSON(res, array);
    });
  } else if (method === 'DELETE') {
    const index = array.findIndex(item => item.id === id);
    if (index === -1) return sendJSON(res, { error: 'Item not found' }, 404);
    array.splice(index, 1);
    data[resourceType] = array;
    writeData(data);
    sendJSON(res, array);
  } else {
    sendJSON(res, { error: 'Method not allowed' }, 405);
  }
}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  const method = req.method;

  if (pathname === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      }
    });
  } else if (pathname.startsWith('/movies')) {
    handleResource(req, res, pathname, method, 'movies');
  } else if (pathname.startsWith('/series')) {
    handleResource(req, res, pathname, method, 'series');
  } else if (pathname.startsWith('/songs')) {
    handleResource(req, res, pathname, method, 'songs');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
