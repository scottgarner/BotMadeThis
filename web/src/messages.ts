import "./messages.css";

class MessagesSingleton {

    private static instance: MessagesSingleton;
    public static get Instance(): MessagesSingleton {
        if (MessagesSingleton.instance == undefined) {
            MessagesSingleton.instance = new MessagesSingleton();
        }
        return MessagesSingleton.instance;
    }

    messageQueue: string[] = [];

    constructor() {
        setInterval(() => {
            // console.log("Processing messages...");
            if (this.messageQueue.length > 0) {
                let message = this.messageQueue.pop();

                let messageDiv = document.createElement("div");
                let messageBodyDiv = document.createElement("div");

                messageDiv.classList.add("message");
                messageBodyDiv.classList.add("messageBody");

                messageBodyDiv.innerHTML = message;

                messageDiv.appendChild(messageBodyDiv);
                document.body.appendChild(messageDiv);

                setTimeout(() => {
                    document.body.removeChild(messageDiv);
                }, 15000);
            }
        }, 1000);
    }

    enqueue(message) {
        this.messageQueue.push(message);
    }
}

export const Messages = MessagesSingleton.Instance;