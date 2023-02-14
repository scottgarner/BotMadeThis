import "./backendBridge.css";

import { Userstate } from "tmi.js";
import { Messages } from "./messages";

class BackendBridge {
    commands: Map<string, (data: any) => void> = new Map();
    chatCommands: Map<string, (userstate: Userstate, message: string) => void> = new Map();

    credits: Map<string, number> = new Map();

    ws: WebSocket
    indicatorDiv: HTMLDivElement;
    alertAudio: HTMLAudioElement;

    say(message) {
        this.ws.send(JSON.stringify({
            type: "say", message
        }));
    }

    constructor() {

        this.indicatorDiv = window.document.createElement("div");
        this.indicatorDiv.setAttribute("id", "indicator");
        window.document.body.appendChild(this.indicatorDiv);
        console.log(this.indicatorDiv);

        this.alertAudio = window.document.createElement("audio");
        this.alertAudio.setAttribute("src", "audio/alert.mp3");
        window.document.body.appendChild(this.alertAudio);

        this.chatCommands.set(
            "!heat", data => {
                const messageBody = "Heat is a Twitch Extension that allows for user engagement through clicking directly on the video. Learn more at https://heat.j38.net/."
                this.say(messageBody);
            });

        this.chatCommands.set("!discord", data => {
            const messageBody = "https://discord.gg/GtAffRP"
            this.say(messageBody);
        });

        this.chatCommands.set("!portfolio", data => {
            const messageBody = "https://scottmadethis.net/"
            this.say(messageBody);
        });

        this.chatCommands.set("!youtube", data => {
            const messageBody = "https://www.youtube.com/scottgarner"
            this.say(messageBody);
        });

        this.chatCommands.set("!peptalk", data => {
            const messageBody = "You're doing great!"
            this.say(messageBody);
        });

        this.chatCommands.set(
            "!lurk", (userstate, message) => {
                const messageBody = "<b>" + userstate["display-name"] + "</b> is lurking in the shadows...";
                Messages.enqueue(messageBody);
            }
        );

        this.chatCommands.set(
            "!alert", (userstate, message) => {
                const messageBody = "Alert from <b>" + userstate["display-name"] + "</b>";
                const badges = userstate.badges;

                if (
                    badges &&
                    (badges.broadcaster ||
                        badges.moderator ||
                        //badges.subscriber ||
                        badges.vip)
                ) {
                    Messages.enqueue(messageBody);
                    this.audioAlert();
                }
            });

        this.chatCommands.set(
            "!credits", (userstate, message) => {
                this.say(JSON.stringify(Array.from(this.credits.entries())));
            }
        )

        //

        this.commands.set("cheer", data => {
            console.log(data);

            let message =
                "<b>" +
                data.userstate["display-name"] +
                "</b> cheered with <b>" +
                data.userstate["bits"] +
                "</b> bits";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("new_chatter", data => {
            console.log(data);

            let message =
                "Welcome to the channel, <b>" +
                data.username +
                "</b>";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("raided", data => {
            console.log(data);

            let message =
                "New raid from <b>" +
                data.username +
                "</b> with <b>" +
                data.viewers +
                "</b> viewers";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("resub", data => {
            console.log(data);

            let message =
                "Resub from <b>" +
                data.username +
                "</b> for <b>" +
                data.streakMonths +
                "</b> months";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("subscription", data => {
            console.log(data);

            let message = "New sub from <b>" + data.username + "</b>";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("subgift", data => {
            console.log(data);

            let senderCount = ~~data.userstate["msg-param-sender-count"];
            let message =
                "<b>" +
                data.username +
                "</b> gifted a sub to <b>" +
                data.recipient +
                "</b> (<b>" +
                senderCount +
                "</b> total)";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("submysterygift", data => {
            console.log(data);

            let senderCount = ~~data.userstate["msg-param-sender-count"];
            let message =
                "<b>" +
                data.username +
                "</b> gifted <b>" +
                data.numbOfSubs +
                "</b> (<b>" +
                senderCount +
                "</b> total)";
            Messages.enqueue(message);

            this.audioAlert();
        });

        this.commands.set("follows", data => {
            this.audioAlert();

            data.follows.forEach(item => {
                let message = "New follow from <b>" + item.from_name + "</b>";
                Messages.enqueue(message);
            });
        });

        this.commands.set("channel.update", data => {
            const messageBody = "<b>Channel Updated</b>: " + data.title;
            Messages.enqueue(messageBody);
        });

        this.commands.set("chat", data => {
            let userstate = data.userstate;
            let message = data.message;

            // Chat commands.
            if (message.length > 0) {
                let messageArray = message.split(" ");
                if (this.chatCommands.has(messageArray[0])) {
                    console.log(messageArray[0]);
                    let chatCommand = this.chatCommands.get(messageArray[0]);
                    chatCommand(userstate, message);
                }
            }

            // Credits.
            {
                const displayName = data.userstate["display-name"];
                let messageCount = 1;
                if (this.credits.has(displayName)) {
                    messageCount = this.credits.get(displayName);
                    messageCount++;
                }
                this.credits.set(displayName, messageCount);
            }
        });

        //

        this.connect();
    }

    connect() {
        let hostname = window.location.hostname;
        this.ws = new WebSocket("ws://" + hostname + ":8077");

        // Handle new connections.

        this.ws.addEventListener("open", () => {
            console.log("OPEN");
            this.indicatorDiv.classList.add("connected");
        });

        // Handle messages.
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log(data);


            if (this.commands.has(data.type)) {
                let command = this.commands.get(data.type);
                command(data);
            }

        }

        // Handle errors.
        this.ws.addEventListener("error", (e) => {
            console.log(e);
        });

        // Reconnect if closed.
        this.ws.addEventListener("close", (e) => {
            this.indicatorDiv.classList.remove("connected");

            console.log("CLOSE");
            console.log(e);
            this.ws = null;

            setTimeout(this.connect.bind(this), 1000);
        });
    }

    audioAlert() {
        this.alertAudio.play().catch(e => {
            console.log(e);
        });
    }

}
export default BackendBridge;