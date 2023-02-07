import { OBS } from "./obs";
import { Messages } from "./messages";
import BackendBridge from "./backendBridge";

const bridge = new BackendBridge();

console.log(OBS);

Messages.enqueue("All Systems Go!");