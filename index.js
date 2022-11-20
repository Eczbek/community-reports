import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { join, parse } from "node:path";
import { randomUUID } from 'node:crypto';
import Database from "better-sqlite3";
import mime from "mime/lite.js";

const database = Database("./database.sqlite");
database.prepare("CREATE TABLE IF NOT EXISTS Posts (request TEXT, location TEXT, description TEXT, images TEXT, timestamp INTEGER, uuid TEXT)").run();

const server = createServer((request, response) => {
	if (request.method === "GET") {
		const url = parse(request.url);
		createReadStream(join("./client", join(url.dir, url.base)))
			.on("open", function() {
				response.setHeader("Content-Type", mime.getType(url.ext));
				this.pipe(response);
			})
			.on("error", () => response.writeHead(404).end());
	} else if (request.method === "POST") {
		const buffer = [];
		request
			.on("data", (chunk) => buffer.push(chunk))
			.on("end", () => {
				try {
					const message = JSON.parse(Buffer.concat(buffer));
					console.log(message);
					switch (message.type) {
						case "createPost":
							if (!message.request?.length || !message.location?.trim()?.length) {
								response.end(JSON.stringify({
									failure: "Missing stuff"
								}));
                				break;
							}
							database.prepare("INSERT INTO Posts (request, location, description, images, timestamp, uuid) VALUES (?, ?, ?, ?, ?, ?)").run(message.request, message.location, message.description, message.images, Date.now(), randomUUID());
							response.end(JSON.stringify({
								success: "Posted message"
							}));
							break;
						case "getPosts":
							{
								// console.log('all posts:', database.prepare("SELECT * FROM Posts ORDER BY timestamp").all())
								response.end(JSON.stringify(((message.request === "*")
									? database.prepare("SELECT * FROM Posts ORDER BY timestamp DESC").all()
									: database.prepare("SELECT * FROM Posts WHERE request = ? ORDER BY timestamp DESC").all(message.request))
										.filter(({ location, description }) => (location.toUpperCase().includes(message.location.toUpperCase()) || message.location.toUpperCase().includes(location.toUpperCase())) && (description.toUpperCase().includes(message.description.toUpperCase()) || message.description.toUpperCase().includes(description.toUpperCase())))));
							}
							break;
						case 'removePost':
							database.prepare('DELETE FROM Posts WHERE uuid = ?').run(message.uuid);
							response.end(JSON.stringify({
								success: 'Removed post'
							}));
							break;
					}
				} catch(error) {
					console.log(error);
					response.end(JSON.stringify({
						failure: "Error while parsing message"
					}));
				}
			})
			.on("error", () => response.end(JSON.stringify({
				failure: "Error while reading message"
			})));
	}
}).listen(8080);
