import jevIf, { jevSwitch } from "./jevIf.js";

const msg = "wow, great, prod went down again at 6pm on a Friday 🙃";

if (await jevIf`is ${msg} sarcastic?`) console.log("sarcasm detected. calling HR.");

console.log("P(sarcasm) =", await jevIf.prob("Is this sarcasm?", msg));

await jevSwitch(msg, {
  "Is this person quitting?": () => console.log("🚪"),
  "Is this person frustrated with work?": () => console.log("☕ send coffee"),
}, () => console.log("all good, apparently"));
