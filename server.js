var http = require('http');

var fs = require('fs');

var path = require('path');

var mime = require('mime');

var cache = {};

function send404(resp) {
	resp.writeHead(404, {
		'Content-Type': 'text/plain'
	});
	resp.write('Error 404: resource not found');
	resp.end();
}

function sendFile(resp, filePath, fileContent) {
	resp.writeHead(200, {
		'Content-Type': mime.lookup(path.basename(filePath))
	});
	resp.end(fileContent);
}

function serveStatic(resp, cache, absPath) {
	if (cache[absPath]) {
		sendFile(resp, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if (exists) {
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(resp);
					} else {
						cache[absPath] = data;
						sendFile(resp, absPath, data);
					}
				});
			} else {
				send404(resp);
			}
		});
	}
}

var server = http.createServer(function(req, resp) {
	var filePath;
	if (req.url === "/") {
		filePath = "public/index.html";
	} else {
		filePath = "public" + req.url;
	}
	var absPath = "./" + filePath;
	serveStatic(resp, cache, absPath);
});
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);
