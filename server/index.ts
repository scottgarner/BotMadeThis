const express = require('express')
const app = express()
const port = 8077
const server = require("http").Server(app);

app.use(express.static('../web/dist'))

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// Endpoint

import { WebSocketEndpoint } from "./lib/websocketEndpoint";
const endpoint = new WebSocketEndpoint(server);

// Twitch Chat Bridge
import { TwitchChatBridge } from "./lib/twitchChatBridge";
const twitchChatBridge = new TwitchChatBridge(endpoint);

// Twitch EventSub Bridge
import { TwitchEventSubBridge } from "./lib/twitchEventSubBridge";
const twitchEventSubBridge = new TwitchEventSubBridge(endpoint);
twitchEventSubBridge.on("stream.online", (data) => {
    console.log("Stream Up!");
});

// Stupid auth stuff. I hate it.
let scope = ("chat:read chat:edit moderator:read:followers");

let url = new URL("https://id.twitch.tv/oauth2/authorize");
url.searchParams.append("response_type", "token");
url.searchParams.append("client_id", "dqybxzvszgyeik13apw2v2dm0uk1r2");
url.searchParams.append("redirect_uri", "http://localhost:8077");
url.searchParams.append("scope", scope);
url.searchParams.append("state", "xxx");

console.log(url.toString());
