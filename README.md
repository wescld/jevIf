# jevIf

> O `if` foi inventado em 1957. Tava na hora de ele ter bom senso.

`jevIf` substitui o `if` pelo [Jev](https://docs.typesafe.ai), o modelo System One da TypeSafe. Em vez de comparar valores, você pergunta.

```js
// antes
if (msg.includes("ótimo") && msg.includes("🙃") && isFriday() && hour >= 18) {
  // provavelmente sarcasmo?? talvez??
}

// depois
if (await jevIf`${msg} é sarcasmo?`) {
  chamarORH();
}
```

**1 arquivo · 0 dependências · 100% vibes**

---

## Instalação

Copia o arquivo. Sério, é um arquivo só.

```bash
curl -O https://raw.githubusercontent.com/wescld/jevIf/main/jevIf.js
export TYPESAFE_API_KEY=sua-chave
```

Roda em Node 18+, Bun e Deno. Não use no browser: a chave vazaria.

## Uso

### `jevIf` com template string

Os valores em `${}` viram contexto separado. A pergunta aponta pra eles, e o texto não é só colado na pergunta.

```js
import jevIf from "./jevIf.js";

if (await jevIf`${email} é golpe?`) moverPraLixeira(email);
if (await jevIf`${commit.message} descreve o que ${commit.diff} faz?`) aprovar();
```

### `jevIf` como função

```js
if (await jevIf("O cliente quer cancelar a assinatura?", ticket)) {
  oferecerDesconto();
}

// pra decisões com consequência, peça mais certeza
if (await jevIf("Isso é spam?", comentario, { threshold: 0.9 })) apagar(comentario);

// deixe claro o que conta como "sim"
await jevIf("O candidato sabe Python?", curriculo, {
  criteria: { true: "Usou Python em trabalho real", false: "Só citou num curso" },
});
```

O `state` pode ser string ou objeto (vai como JSON).

### `jevIf.prob`: a dúvida do Jev

```js
await jevIf.prob("Isso é sarcasmo?", msg); // 0.93
```

### `jevSwitch`: else if, mas com vibes

Todas as condições vão **numa única requisição**. Roda a primeira que der "sim".

```js
import { jevSwitch } from "./jevIf.js";

await jevSwitch(msg, {
  "A pessoa está pedindo demissão?": () => abrirVaga(),
  "A pessoa está frustrada com o trabalho?": () => mandarCafe(),
}, () => console.log("tudo certo, aparentemente"));
```

## Opções

| Opção | Padrão | O que faz |
| --- | --- | --- |
| `threshold` | `0.5` | P(sim) mínima pra dar `true` |
| `criteria` | — | `{ true, false }` explicando cada lado |
| `model` | `"jev-latest"` | Modelo da TypeSafe |
| `apiKey` | `process.env.TYPESAFE_API_KEY` | Sua chave |

## Benchmark

| | `if` | `jevIf` |
| --- | --- | --- |
| Latência | ~1 ns | ~150 ms |
| Custo | grátis | não é grátis |
| Entende sarcasmo | ❌ | ✅ |
| Entende `===` vs `==` | mais ou menos | não é o foco |
| Vibes | 0 | ∞ |

## FAQ

**Devo usar isso em produção?**
`await jevIf("Devo usar isso em produção?", seuCodigo)`

**E se o Jev errar?**
Ele devolve probabilidades, não verdades. Ajuste o `threshold` com dados reais e mantenha um humano no loop quando o erro custar caro.

**Posso usar pra `x > 5`?**
Pode. Não deve. Use o `if`, ele continua disponível e trabalhando muito bem.

**Vai ter `jevWhile`?**
Em breve. Tá rodando enquanto o Jev achar que faz sentido.

## Como funciona

Cada `jevIf` faz uma pergunta do tipo [`noul`](https://docs.typesafe.ai/primitives/noul) (sim/não com probabilidade) na [API da TypeSafe](https://docs.typesafe.ai/api) e compara a resposta com o `threshold`. O `jevSwitch` faz o mesmo com várias perguntas numa chamada só. É isso.

## Licença

MIT. Faça o que quiser, inclusive perguntar ao Jev se deveria.
