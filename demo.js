import jevIf, { jevSwitch } from "./jevIf.js";

const msg = "nossa, que ótimo, o deploy caiu de novo numa sexta às 18h 🙃";

if (await jevIf`${msg} é sarcasmo?`) console.log("detectado sarcasmo. chamando o RH.");

console.log("P(sarcasmo) =", await jevIf.prob("Isso é sarcasmo?", msg));

await jevSwitch(msg, {
  "A pessoa está pedindo demissão?": () => console.log("🚪"),
  "A pessoa está frustrada com o trabalho?": () => console.log("☕ manda um café"),
}, () => console.log("tudo certo, aparentemente"));
