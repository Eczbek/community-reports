import { createServer } from 'node:http';
import { join, parse } from 'node:path';
import Database from 'better-sqlite3';
import mime from 'mime/lite.js';
import { WebSocketServer } from 'ws';

const database = Database('./database.sqlite');
database.prepare('CREATE TABLE IF NOT EXISTS Posts (title TEXT, category TEXT, description TEXT, image TEXT, timestamp INTEGER)').run();

const sockets = new Set();

new WebSocketServer({
	server: createServer((request, response) => {
		const url = parse(request.url);
		createReadStream(join('./client', join(url.dir, url.base)))
			.on('open', function() {
				response.setHeader('Content-Type', mime.getType(url.ext));
				this.pipe(response);
			})
			.on('error', () => response.writeHead(404).end());
	}).listen(8080);
}).on('connection', (socket) => {
	sockets.add(socket);
	socket
		.on('message', (buffer) => {
			try {
				const message = JSON.parse(buffer);
				switch (message.type) {
					case 'post':
						{
							const title = message.title?.trim();
							const category = message.category?.trim();
							const description = message.description?.trim();
							const image = message.image;
							if (!title || !category || !description) {
								socket.send(JSON.stringify({
									failure: 'Missing post properties'
								}));
								break;
							}
							database.prepare('INSERT INTO Posts (title, category, description, image, timestamp, resolved) VALUES (?, ?, ?, ?, ?)').run(title, category, description, image, Date.now());
						}
						[...sockets].forEach((socket) => socket.send(JSON.stringify({
							type: 'posts',
							posts: JSON.stringify(database.prepare('SELECT * FROM Posts'))
						})))
						break;
					default:
						socket.send(JSON.stringify({
							failure: 'Unknown message type'
						}));
				}
			} catch {
				socket.send(JSON.stringify({
					failure: 'Cannot parse message'
				}));
			}
		})
		.on('close', () => sockets.delete(socket));
});
