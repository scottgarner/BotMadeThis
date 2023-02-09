import WebSocket from 'ws';
import dotenv from "dotenv";
import { WebSocketEndpoint } from './websocketEndpoint';
import { EventEmitter } from 'node:events';

dotenv.config();
const token = process.env.ACCESS_TOKEN;
const clientId = process.env.CLIENT_ID;

export class TwitchEventSubBridge extends EventEmitter {
    ws: WebSocket;
    endpoint: WebSocketEndpoint;

    constructor(endpoint: WebSocketEndpoint) {
        super();

        this.endpoint = endpoint;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket('wss://eventsub-beta.wss.twitch.tv/ws');

        this.ws.onopen = () => {
            console.log("Connected to EventSub.");
        };

        this.ws.onmessage = async (e) => {
            let data = JSON.parse(e.data);

            if (data.metadata.message_type == "notification") {
                const type = data.metadata.subscription_type;
                this.endpoint.broadcast(JSON.stringify({ type, ...data.payload.event }));
                this.emit(type, data.payload.event);
            }

            // Handle Welcome Message.
            if (data.metadata.message_type == "session_welcome") {
                let id = data.payload.session.id;

                this.subscribe(id, "channel.update", 1);
                this.subscribe(id, "stream.online", 1);
                this.subscribe(id, "stream.offline", 1);
            }
        };

        this.ws.addEventListener("close", (e) => {
            this.ws = null;
            setTimeout(this.connect.bind(this), 1000);
        });
    }

    async subscribe(id: string, type: string, version: string | number) {
        {
            console.log("Subscribing to " + type);
            const method = "POST";
            const headers = {
                'Authorization': 'Bearer ' + token,
                'Client-Id': clientId,
                'Content-Type': 'application/json'
            }

            const body =
                JSON.stringify({
                    "type": type,
                    "version": version,
                    "condition": {
                        "broadcaster_user_id": "97032862",
                        // "moderator_user_id": "97032862"
                    },
                    "transport": {
                        "method": "websocket",
                        "session_id": id
                    }
                });

            const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
            const options = {
                method, headers, body
            }

            fetch(url, options)
                .then((response) => {
                    console.log(type, response!.status, response!.statusText);
                })
                .catch((error) => {
                    console.log("Subscription failed!");
                })
        }
    };
}

