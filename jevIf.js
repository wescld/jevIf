// jevIf — porque `if` é determinístico demais.
//
//   if (await jevIf`${msg} é sarcasmo?`) { ... }
//   if (await jevIf("o cliente está bravo?", ticket)) { ... }
//
// Sem dependências. Precisa de TYPESAFE_API_KEY no ambiente (só server-side).

const URL = "https://api.typesafe.ai/v1/systemone";

/** Faz várias perguntas sim/não de uma vez; devolve P(sim) de cada uma, na ordem. */
async function ask(questions, state = "", { model = "jev-latest", apiKey = process.env.TYPESAFE_API_KEY } = {}) {
  if (!apiKey) throw new Error("jevIf: defina TYPESAFE_API_KEY (o if clássico continua disponível)");

  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      state: typeof state === "string" ? state : JSON.stringify(state),
      questions: Object.fromEntries(questions.map(({ question, criteria }, i) => [`q${i}`, { type: "noul", instructions: question, ...(criteria && { criteria }) }])),
    }),
  });
  if (!res.ok) throw new Error(`jevIf: ${res.status} ${await res.text()}`);

  const { answers } = await res.json();
  return questions.map((_, i) => answers[`q${i}`].noul);
}

/** Probabilidade de "sim" (0–1) para uma pergunta sobre um estado. */
const jevProb = (question, state, opts = {}) => ask([{ question, criteria: opts.criteria }], state, opts).then(([p]) => p);

/**
 * O `if` com bom senso. Resolve `true` quando P(sim) >= threshold (padrão 0.5).
 *
 * Função:          await jevIf("isso é spam?", email, { threshold: 0.8 })
 * Template string: await jevIf`${email} é spam?`
 */
export function jevIf(questionOrStrings, ...rest) {
  // Tagged template: os valores interpolados viram state, e a pergunta aponta pra eles.
  if (Array.isArray(questionOrStrings) && "raw" in questionOrStrings) {
    const values = rest;
    const question = questionOrStrings.reduce((q, s, i) => q + (i ? `\`values[${i - 1}]\`` : "") + s, "");
    return jevProb(question, { values }).then((p) => p >= 0.5);
  }

  const [state, opts = {}] = rest;
  return jevProb(questionOrStrings, state, opts).then((p) => p >= (opts.threshold ?? 0.5));
}

/** Pra quem quer ver a dúvida do Jev em vez de só o veredito. */
jevIf.prob = jevProb;

/** else if, mas com vibes: roda a primeira condição que o Jev achar verdadeira. */
export async function jevSwitch(state, cases, fallback) {
  const probs = await ask(Object.keys(cases).map((question) => ({ question })), state);
  const i = probs.findIndex((p) => p >= 0.5);
  return i >= 0 ? Object.values(cases)[i]() : fallback?.();
}

export default jevIf;
