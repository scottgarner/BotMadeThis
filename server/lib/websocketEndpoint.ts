import WebSocket, { WebSocketServer } from 'ws';
import dotenv from "dotenv";
import { EventEmitter } from 'node:events';

dotenv.config();

const channel = process.env.CHANNEL_NAME;

export class WebSocketEndpoint extends EventEmitter {

    wss: WebSocketServer;

    constructor(server) {
        super();

        this.wss = new WebSocket.Server({ server: server });

        this.wss.on("connection", (ws) => {

            ws.on("message", message => {
                // console.log("received: %s", message);

                this.emit("message", message);

                // if (messageData.type == "uptime") {
                //     uptime();
                // }

                // if (messageData.type == "followage") {
                //     followage(messageData);
                // }

                // if (messageData.type == "subage") {
                //   subage(messageData);
                // }
            });
        });
    }

    broadcast(data) {
        // console.log(data);
        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    };

}