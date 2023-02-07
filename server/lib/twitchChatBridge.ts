import tmi from "tmi.js";
import dotenv from "dotenv";
import { WebSocketEndpoint } from "./websocketEndpoint";

dotenv.config();

const username = process.env.BOT_NAME;
const channel = process.env.CHANNEL_NAME;
const token = process.env.ACCESS_TOKEN;

export class TwitchChatBridge {
    client: tmi.Client;

    constructor(endpoint: WebSocketEndpoint) {
        console.log("Connecting to Twitch chat.");
        // tmi.js

        const options = {
            identity: {
                username: username,
                password: "oauth:" + token
            },
            channels: [channel]
        };

        this.client = new tmi.Client(options);

        this.client.on("chat", (channel, userstate, message, self) => {
            const type = "chat";
            endpoint.broadcast(JSON.stringify({ type, channel, userstate, message, self }));
        });

        this.client.on("resub", (channel, username, streakMonths, message, tags, methods) => {
            const type = "resub";
            endpoint.broadcast(JSON.stringify({ type, channel, username, streakMonths, message, tags, methods }));
        });

        this.client.on("subscription", (channel, username, method, message, userstate) => {
            const type = "subscription";
            endpoint.broadcast(JSON.stringify({ type, channel, username, method, message, userstate }));
        });

        this.client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
            const type = "subgift";
            endpoint.broadcast(JSON.stringify({ type, channel, username, streakMonths, recipient, methods, userstate }));
        });

        this.client.on("submysterygift", (channel, username, giftSubCount, methods, userstate) => {
            const type = "submysterygift";
            endpoint.broadcast(JSON.stringify({ type, channel, username, giftSubCount, methods, userstate }));
        });

        this.client.on("raided", (channel, username, viewers, userstate) => {
            const type = "raided";
            endpoint.broadcast(JSON.stringify({ type, channel, username, viewers, userstate }));
        });

        this.client.on("new_chatter", (channel, username, userstate, message) => {
            const type = "new_chatter";
            endpoint.broadcast(JSON.stringify({ type, channel, username, userstate, message }));
        });

        this.client.on("cheer", (channel, userstate, message) => {
            const type = "cheer";
            endpoint.broadcast(JSON.stringify({ type, channel, userstate, message }));
        });

        this.client.on("connected", (addr, port) => {
            console.log(`* Connected to ${addr}:${port}`);
        });

        this.client.connect();

        // Websocket relay server.
        endpoint.on("message", (message) => {
            let messageData = JSON.parse(message);
            if (messageData.type == "say") {
                this.client.say(channel, messageData.message);
            }
        });
    }
}