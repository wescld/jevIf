// jevIf — because `if` is way too deterministic.
//
//   if (await jevIf`is ${msg} sarcastic?`) { ... }
//   if (await jevIf("is the customer angry?", ticket)) { ... }
//
// Zero dependencies. Needs TYPESAFE_API_KEY in the environment (server-side only).

const URL = "https://api.typesafe.ai/v1/systemone";

/** Asks several yes/no questions at once; returns P(yes) for each, in order. */
async function ask(questions, state = "", { model = "jev-latest", apiKey = process.env.TYPESAFE_API_KEY } = {}) {
  if (!apiKey) throw new Error("jevIf: set TYPESAFE_API_KEY (classic if is still available)");

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

/** Probability of "yes" (0–1) for a question about some state. */
const jevProb = (question, state, opts = {}) => ask([{ question, criteria: opts.criteria }], state, opts).then(([p]) => p);

/**
 * `if` with common sense. Resolves `true` when P(yes) >= threshold (default 0.5).
 *
 * Function:        await jevIf("is this spam?", email, { threshold: 0.8 })
 * Template string: await jevIf`is ${email} spam?`
 */
export function jevIf(questionOrStrings, ...rest) {
  // Tagged template: interpolated values become state, and the question points to them.
  if (Array.isArray(questionOrStrings) && "raw" in questionOrStrings) {
    const values = rest;
    const question = questionOrStrings.reduce((q, s, i) => q + (i ? `\`values[${i - 1}]\`` : "") + s, "");
    return jevProb(question, { values }).then((p) => p >= 0.5);
  }

  const [state, opts = {}] = rest;
  return jevProb(questionOrStrings, state, opts).then((p) => p >= (opts.threshold ?? 0.5));
}

/** For when you want Jev's doubt, not just the verdict. */
jevIf.prob = jevProb;

/** else if, but with vibes: runs the first case Jev thinks is true. */
export async function jevSwitch(state, cases, fallback) {
  const probs = await ask(Object.keys(cases).map((question) => ({ question })), state);
  const i = probs.findIndex((p) => p >= 0.5);
  return i >= 0 ? Object.values(cases)[i]() : fallback?.();
}

export default jevIf;
