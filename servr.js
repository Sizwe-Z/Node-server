const http = require('node: http');
const url = require('url');

let movies = [
  { id: 1, title: "A Perfect Enemy", director: "Kike Maíllo", year: 2020 },
  { id: 2, title: "Shrek", director: "Andrew Adamson", year: 2001} ];

let series = [
  { id: 1, title: "One piece", seasons: 5, creator: "Eiichiro Oda" },
  { id: 2, title: "Stranger Things", seasons: 4, creator: "The Duffer Brothers" }
];

let songs = [
  { id: 1, title: "Stan", artist: "Eminem", year: 2000 },
  { id: 2, title: "Destiny", artist: " jennifer rush", year: 1985 }
];

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => callback(JSON.parse(body || '{}')));
}

function handleResource(req, res, pathname, method, data) {
  const id = parseInt(pathname.split('/')[2]);
  if (method === 'GET') {
    sendJSON(res, data);
  } else if (method === 'POST') {
    parseBody(req, body => {
      const newItem = { id: data.length + 1, ...body };
      data.push(newItem);
      sendJSON(res, data);
    });
  } else if (method === 'PUT') {
    if (!id) return sendJSON(res, { error: "ID required" }, 400);
    parseBody(req, body => {
      const index = data.findIndex(item => item.id === id);
      if (index === -1) return sendJSON(res, { error: "Item not found" }, 404);
      data[index] = { ...data[index], ...body };
      sendJSON(res, data);
    });
  } else if (method === 'DELETE') {
    if (!id) return sendJSON(res, { error: "ID required" }, 400);
    const index = data.findIndex(item => item.id === id);
    if (index === -1) return sendJSON(res, { error: "Item not found" }, 404);
    data.splice(index, 1);
    sendJSON(res, data);
  } else {
    sendJSON(res, { error: "Method not allowed" }, 405);
  }
}

const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url, true);
    const method = req.method;
  
    if (pathname.startsWith('/movies')) {
      handleResource(req, res, pathname, method, movies);
    } else if (pathname.startsWith('/series')) {
      handleResource(req, res, pathname, method, series);
    } else if (pathname.startsWith('/songs')) {
      handleResource(req, res, pathname, method, songs);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  });
  
  server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });

  