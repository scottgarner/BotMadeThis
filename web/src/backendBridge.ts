import { Userstate } from "tmi.js";
import { Messages } from "./messages";

class ChatBot {
    commands: Map<string, (userstate: Userstate, message: string) => void> = new Map();
    credits: Map<string, number> = new Map();

    ws: WebSocket

    say(message) {
        this.ws.send(JSON.stringify({
            type: "say", message
        }));
    }

    constructor() {
        this.commands.set(
            "!heat", data => {
                const messageBody = "Heat is a Twitch Extension that allows for user engagement through clicking directly on the video. Learn more at https://heat.j38.net/."
                this.say(messageBody);
            });

        this.commands.set("!discord", data => {
            const messageBody = "https://discord.gg/GtAffRP"
            this.say(messageBody);
        });

        this.commands.set("!portfolio", data => {
            const messageBody = "https://scottmadethis.net/"
            this.say(messageBody);
        });

        this.commands.set("!youtube", data => {
            const messageBody = "https://www.youtube.com/scottgarner"
            this.say(messageBody);
        });

        this.commands.set("!peptalk", data => {
            const messageBody = "You're doing great!"
            this.say(messageBody);
        });

        this.commands.set(
            "!lurk", (userstate, message) => {
                const messageBody = "<b>" + userstate["display-name"] + "</b> is lurking in the shadows...";
                Messages.enqueue(messageBody);
            }
        );

        this.commands.set(
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
                    // audioAlert();
                }
            });

        this.commands.set(
            "!credits", (userstate, message) => {
                this.say(JSON.stringify(Array.from(this.credits.entries())));
            }
        )

        this.ws = new WebSocket("ws://localhost:8077");

        this.ws.onopen = () => {
            console.log("OPEN");
        }

        this.ws.onmessage = (event) => {
            const messageData = JSON.parse(event.data);

            console.log(messageData);

            if (messageData.type == "chat") {
                let userstate = messageData.userstate;
                let message = messageData.message;
                // Commands.
                if (message.length > 0) {
                    let messageArray = message.split(" ");
                    if (this.commands.has(messageArray[0])) {
                        console.log(messageArray[0]);
                        let chatCommand = this.commands.get(messageArray[0]);
                        chatCommand(userstate, message);
                    }
                }
            }

            if (messageData.type == "channel.update") {
                const messageBody = "<b>Channel Updated</b>: " + messageData.title;
                Messages.enqueue(messageBody);
            };

            // Credits.
            {
                const displayName = messageData.userstate["display-name"];
                let messageCount = 1;
                if (this.credits.has(displayName)) {
                    messageCount = this.credits.get(displayName);
                    messageCount++;
                }
                this.credits.set(displayName, messageCount);
            }

        }

    }
}
export default ChatBot;