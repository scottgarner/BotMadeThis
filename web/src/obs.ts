import "./obs.css";
import P5 from "p5/lib/p5.min.js";

let level = 0;

let ws = new WebSocket("ws://localhost:4444/");

ws.addEventListener("open", (event) => {
    console.log("Connected to OBS");
});

ws.addEventListener("message", (event) => {

    let data = JSON.parse(event.data);

    if (data.op == 0) {

        let identify = {
            op: 1,
            d: {
                rpcVersion: 1,
                authentication: "",
                eventSubscriptions: 1 << 16,
            },
        };

        ws.send(JSON.stringify(identify));
    } else if (data.op == 5) {
        if (data.d.eventIntent == 1 << 16) {

            let activeIndex = 0;
            data.d.eventData.inputs.forEach((input, index) => {

                if (input.inputLevelsMul.length > 0) {
                    let levelLeft = input.inputLevelsMul[0][0];
                    let levelRight = input.inputLevelsMul[1][0];

                    // console.log(input.inputName, levelLeft, levelRight);

                    // const meterLeft = document.querySelector(`[data-meter='${activeIndex},0']`);
                    // meterLeft.style.height = (levelLeft * 100) + "%";

                    // const meterRight = document.querySelector(`[data-meter='${activeIndex},1']`);
                    // meterRight.style.height = (levelRight * 100) + "%";

                    if (input.inputName == "Rode NT-Mini") {
                        level = levelLeft;
                    }

                    activeIndex++;
                }

            });


        }
    }
});

let sketch = (sketch) => {
    sketch.setup = () => {

        sketch.createCanvas(128, 128);
        sketch.rectMode(sketch.CENTER);
    }

    sketch.draw = () => {
        sketch.background(32, 32, 48);

        sketch.noStroke();
        sketch.fill("#22ddaa");

        sketch.push();
        sketch.translate(sketch.width * .3, sketch.width * .32);
        sketch.rotate(sketch.PI / 4);
        sketch.rect(0, 0, sketch.width / 16, sketch.width / 4);
        sketch.rotate(sketch.PI / 2);
        sketch.rect(0, 0, sketch.width / 16, sketch.width / 4);
        sketch.pop();

        sketch.push();
        sketch.translate(sketch.width - sketch.width * .3, sketch.width * .32);
        sketch.rotate(sketch.PI / 4);
        sketch.rect(0, 0, sketch.width / 16, sketch.width / 4);
        sketch.rotate(sketch.PI / 2);
        sketch.rect(0, 0, sketch.width / 16, sketch.width / 4);
        sketch.pop();

        sketch.noFill();
        sketch.stroke("#22ddaa");
        sketch.strokeWeight(sketch.width / 24);

        sketch.push();
        sketch.translate(sketch.width / 2, sketch.height - sketch.width * .30);
        sketch.rect(0, 0, (sketch.width / 3) - (level * 32), sketch.constrain((sketch.width / 24) + (level * 192), 0, sketch.width / 5));
        sketch.pop();


        sketch.stroke(128, 128, 128);
        sketch.strokeWeight(8);
        sketch.rect(sketch.width / 2, sketch.height / 2, sketch.width, sketch.height);
    }
}

const p5 = new P5(sketch);

console.log("OBS");

export const OBS = {}
