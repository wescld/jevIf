# jevIf

> The `if` statement was invented in 1957. It's about time it got some common sense.

`jevIf` replaces `if` with [Jev](https://docs.typesafe.ai), TypeSafe's System One model. Instead of comparing values, you just ask.

```js
// before
if (msg.includes("great") && msg.includes("🙃") && isFriday() && hour >= 18) {
  // probably sarcasm?? maybe??
}

// after
if (await jevIf`is ${msg} sarcastic?`) {
  callHR();
}
```

**1 file · 0 dependencies · 100% vibes**

---

## Install

Copy the file. Seriously, it's one file.

```bash
curl -O https://raw.githubusercontent.com/wescld/jevIf/main/jevIf.js
export TYPESAFE_API_KEY=your-key
```

Runs on Node 18+, Bun and Deno. Don't use it in the browser: your key would leak.

## Usage

### `jevIf` as a template string

Values inside `${}` are sent as separate context. The question points to them instead of just pasting the text into the question.

```js
import jevIf from "./jevIf.js";

if (await jevIf`is ${email} a scam?`) moveToTrash(email);
if (await jevIf`does ${commit.message} describe what ${commit.diff} does?`) approve();
```

### `jevIf` as a function

```js
if (await jevIf("Does the customer want to cancel their subscription?", ticket)) {
  offerDiscount();
}

// for decisions with consequences, ask for more certainty
if (await jevIf("Is this spam?", comment, { threshold: 0.9 })) remove(comment);

// spell out what counts as "yes"
await jevIf("Does the candidate know Python?", resume, {
  criteria: { true: "Used Python in real work", false: "Only mentioned it in a course" },
});
```

`state` can be a string or an object (sent as JSON).

### `jevIf.prob`: Jev's doubt

```js
await jevIf.prob("Is this sarcasm?", msg); // 0.93
```

### `jevSwitch`: else if, but with vibes

All conditions go out in **a single request**. The first one that comes back "yes" runs.

```js
import { jevSwitch } from "./jevIf.js";

await jevSwitch(msg, {
  "Is this person quitting?": () => openJobPosting(),
  "Is this person frustrated with work?": () => sendCoffee(),
}, () => console.log("all good, apparently"));
```

## Options

| Option | Default | What it does |
| --- | --- | --- |
| `threshold` | `0.5` | Minimum P(yes) to return `true` |
| `criteria` | — | `{ true, false }` describing each side |
| `model` | `"jev-latest"` | TypeSafe model |
| `apiKey` | `process.env.TYPESAFE_API_KEY` | Your key |

## Benchmark

| | `if` | `jevIf` |
| --- | --- | --- |
| Latency | ~1 ns | ~150 ms |
| Cost | free | not free |
| Understands sarcasm | ❌ | ✅ |
| Understands `===` vs `==` | kind of | not its focus |
| Vibes | 0 | ∞ |

## FAQ

**Should I use this in production?**
`await jevIf("Should I use this in production?", yourCode)`

**What if Jev is wrong?**
It returns probabilities, not truths. Tune `threshold` on real data and keep a human in the loop when mistakes are expensive.

**Can I use it for `x > 5`?**
You can. You shouldn't. Use `if`, it's still around and doing great.

**Will there be a `jevWhile`?**
Coming soon. It runs for as long as Jev thinks it makes sense.

## How it works

Each `jevIf` asks a [`noul`](https://docs.typesafe.ai/primitives/noul) question (yes/no with a probability) through the [TypeSafe API](https://docs.typesafe.ai/api) and compares the answer to `threshold`. `jevSwitch` does the same with several questions in one call. That's it.

## License

MIT. Do whatever you want, including asking Jev whether you should.
