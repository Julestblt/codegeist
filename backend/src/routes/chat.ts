import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { vulnSnippet } from "../mocks/vuln-snippet";

const IA_URL = "http://192.168.1.12:1234/v1/chat/completions";
const MODEL = "deepseek/deepseek-r1-0528-qwen3-8b";

interface ChatBody {
  temperature?: number;
  max_tokens?: number;
}

const chatRoutes = async (
  app: FastifyInstance,
  _opts: FastifyPluginOptions
) => {
  app.post<{ Body: ChatBody }>("/", async (req, reply) => {
    const { temperature = 0.0, max_tokens = 5000 } = req.body ?? {};

    const systemPrompt =
      "Tu es un auditeur sécurité expérimenté. " +
      "Analyse le fragment de code PHP fourni et liste de façon concise " +
      "chaque vulnérabilité ou mauvaise pratique (type, gravité, ligne, correctif). " +
      "Réponds en français, format libre.";

    const iaResp = await fetch(IA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: vulnSnippet },
        ],
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!iaResp.ok) {
      const detail = await iaResp.text();
      return reply.status(502).send({ error: "LLM error", detail });
    }

    type Resp = {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const data = (await iaResp.json()) as Resp;
    const content = data.choices?.[0]?.message?.content ?? "";

    return { reply: content };
  });
};

export { chatRoutes };
