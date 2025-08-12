# Migration de l'IA : Anthropic → Solution On-Premise

## État Actuel

### Configuration de l'IA

Le système utilise actuellement **Anthropic Claude** via leur API cloud pour l'analyse de sécurité du code.

**Fichier principal :** `backend/src/queues/scan.queue.ts`

**Dépendances actuelles :**

```json
"@anthropic-ai/sdk": "^0.56.0"
```

**Variables d'environnement :**

```bash
ANTHROPIC_API_KEY=your_api_key_here
LM_MODEL=claude-sonnet-4-20250514  # Par défaut
```

### Implémentation Actuelle

#### 1. Initialisation du client Anthropic

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

const LM_MODEL = process.env.LM_MODEL ?? "claude-sonnet-4-20250514";
```

#### 2. Appel à l'API pour l'analyse

```typescript
async function auditFragment(filename: string, code: string): Promise<any> {
  const message = await anthropic.messages.create({
    model: LM_MODEL,
    max_tokens: 1024,
    temperature: 0,
    system: SYSTEM_PROMPT,
    stream: false,
    messages: [
      {
        role: "user",
        content: `File: ${filename}\n\`\`\`\n${code}\n\`\`\``,
      },
    ],
  });

  // Traitement de la réponse...
}
```

#### 3. Prompt système utilisé

Le système utilise un prompt spécialisé pour l'audit de sécurité (voir `backend/src/constants/index.ts`) qui demande une réponse JSON structurée avec les vulnérabilités trouvées.

## Migration vers une Solution On-Premise

### Options Recommandées

#### Option 1 : Ollama (Recommandée)

**Avantages :**

- Installation simple
- Support de nombreux modèles (Llama, Mistral, etc.)
- API REST compatible
- Pas de coût d'API

**Installation :**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Démarrer le service
ollama serve
```

**Télécharger un modèle :**

```bash
ollama pull llama3.2:3b  # Modèle léger
ollama pull llama3.2:8b  # Modèle équilibré
ollama pull llama3.2:70b # Modèle performant
```

#### Option 2 : LM Studio

**Avantages :**

- Interface graphique
- Support de nombreux modèles
- API REST intégrée
- Gestion des modèles locale

#### Option 3 : vLLM

**Avantages :**

- Performance optimisée
- Support multi-GPU
- API compatible OpenAI
- Déploiement Docker

### Plan de Migration

#### Étape 1 : Créer une interface abstraite

Créer `backend/src/services/ai.service.ts` :

```typescript
export interface AIAnalysisResult {
  issues: Array<{
    name: string;
    type: string;
    severity: "info" | "low" | "medium" | "high" | "critical";
    cwe?: string;
    owasp?: string;
    lines: number[];
    description: string;
    recommendation: string;
  }>;
}

export interface AIService {
  analyzeCode(filename: string, code: string): Promise<AIAnalysisResult>;
}

export class OllamaService implements AIService {
  private baseUrl: string;
  private model: string;

  constructor(
    baseUrl: string = "http://localhost:11434",
    model: string = "llama3.2:8b"
  ) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async analyzeCode(filename: string, code: string): Promise<AIAnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt: `File: ${filename}\n\`\`\`\n${code}\n\`\`\``,
        system: SYSTEM_PROMPT,
        stream: false,
        options: {
          temperature: 0,
          num_predict: 1024,
        },
      }),
    });

    const data = await response.json();
    const responseText = data.response;

    // Nettoyer et parser la réponse JSON
    const cleanedResponse = responseText.replace(
      /<think>[\s\S]*?<\/think>\s*/g,
      ""
    );

    try {
      return JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        `Failed to parse JSON response for ${filename}:`,
        parseError
      );
      return { issues: [] };
    }
  }
}

export class AnthropicService implements AIService {
  private anthropic: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = "claude-sonnet-4-20250514") {
    this.anthropic = new Anthropic({ apiKey });
    this.model = model;
  }

  async analyzeCode(filename: string, code: string): Promise<AIAnalysisResult> {
    const message = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      stream: false,
      messages: [
        {
          role: "user",
          content: `File: ${filename}\n\`\`\`\n${code}\n\`\`\``,
        },
      ],
    });

    const content = message.content[0];
    if (content?.type === "text") {
      const responseText = content.text;
      const cleanedResponse = responseText.replace(
        /<think>[\s\S]*?<\/think>\s*/g,
        ""
      );

      try {
        return JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error(
          `Failed to parse JSON response for ${filename}:`,
          parseError
        );
        return { issues: [] };
      }
    }

    throw new Error("Unexpected response format from Anthropic API");
  }
}
```

#### Étape 2 : Modifier la configuration

Mettre à jour `backend/src/utils/env.ts` :

```typescript
export const {
  DATABASE_URL,
  REDIS_URL,
  REDIS_HOST,
  REDIS_PORT,
  ANTHROPIC_API_KEY,
  AI_SERVICE_TYPE, // 'anthropic' | 'ollama' | 'lmstudio' | 'vllm'
  AI_SERVICE_URL, // URL du service on-premise
  AI_MODEL_NAME, // Nom du modèle à utiliser
  NODE_ENV,
} = process.env;
```

#### Étape 3 : Modifier scan.queue.ts

```typescript
import {
  AIService,
  OllamaService,
  AnthropicService,
} from "@/services/ai.service";

// Remplacer l'initialisation directe d'Anthropic
let aiService: AIService;

function initializeAIService(): AIService {
  const serviceType = process.env.AI_SERVICE_TYPE || "anthropic";

  switch (serviceType) {
    case "ollama":
      return new OllamaService(
        process.env.AI_SERVICE_URL || "http://localhost:11434",
        process.env.AI_MODEL_NAME || "llama3.2:8b"
      );
    case "anthropic":
      if (!ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY is required when using anthropic service"
        );
      }
      return new AnthropicService(
        ANTHROPIC_API_KEY,
        process.env.LM_MODEL || "claude-sonnet-4-20250514"
      );
    default:
      throw new Error(`Unsupported AI service type: ${serviceType}`);
  }
}

// Initialiser le service au démarrage
aiService = initializeAIService();

// Modifier la fonction auditFragment
async function auditFragment(filename: string, code: string): Promise<any> {
  try {
    const result = await aiService.analyzeCode(filename, code);

    betterLog(
      `Response from AI service for ${filename}:\n${JSON.stringify(
        result,
        null,
        2
      )}`
    );

    return result;
  } catch (error) {
    console.error(`Error calling AI service for ${filename}:`, error);
    throw error;
  }
}
```

#### Étape 4 : Mettre à jour les variables d'environnement

`.env.development` :

```bash
# Ancien
ANTHROPIC_API_KEY=your_key_here
LM_MODEL=claude-sonnet-4-20250514

# Nouveau
AI_SERVICE_TYPE=ollama
AI_SERVICE_URL=http://localhost:11434
AI_MODEL_NAME=llama3.2:8b

# Garder pour la compatibilité
ANTHROPIC_API_KEY=your_key_here
LM_MODEL=claude-sonnet-4-20250514
```

`.env.production` :

```bash
AI_SERVICE_TYPE=ollama
AI_SERVICE_URL=http://your-ollama-server:11434
AI_MODEL_NAME=llama3.2:8b
```

### Déploiement Docker

#### Dockerfile pour Ollama

```dockerfile
FROM ollama/ollama:latest

# Copier les modèles pré-téléchargés si nécessaire
COPY models/ /root/.ollama/models/

EXPOSE 11434

CMD ["ollama", "serve"]
```

#### docker-compose.yml

```yaml
version: "3.8"
services:
  # ... autres services ...

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_HOST=0.0.0.0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama_data:
```

### Tests et Validation

#### Test de compatibilité

```typescript
// backend/src/tests/ai-service.test.ts
import { OllamaService, AnthropicService } from "@/services/ai.service";

describe("AI Service Compatibility", () => {
  const testCode = `
function vulnerableFunction(userInput) {
  eval(userInput); // Vulnérabilité critique
  return "processed";
}
`;

  it("should return similar results between services", async () => {
    const ollamaService = new OllamaService();
    const anthropicService = new AnthropicService(
      process.env.ANTHROPIC_API_KEY!
    );

    const ollamaResult = await ollamaService.analyzeCode("test.js", testCode);
    const anthropicResult = await anthropicService.analyzeCode(
      "test.js",
      testCode
    );

    // Vérifier que les deux services détectent au moins la vulnérabilité eval
    expect(ollamaResult.issues.some((i) => i.type.includes("eval"))).toBe(true);
    expect(anthropicResult.issues.some((i) => i.type.includes("eval"))).toBe(
      true
    );
  });
});
```

### Monitoring et Métriques

#### Ajouter des métriques de performance

```typescript
// Dans ai.service.ts
export interface AIMetrics {
  responseTime: number;
  tokensUsed: number;
  modelName: string;
  serviceType: string;
}

export class AIServiceWithMetrics implements AIService {
  constructor(private service: AIService) {}

  async analyzeCode(filename: string, code: string): Promise<AIAnalysisResult> {
    const startTime = Date.now();

    try {
      const result = await this.service.analyzeCode(filename, code);

      const metrics: AIMetrics = {
        responseTime: Date.now() - startTime,
        tokensUsed: this.estimateTokens(code),
        modelName: process.env.AI_MODEL_NAME || "unknown",
        serviceType: process.env.AI_SERVICE_TYPE || "unknown",
      };

      // Envoyer les métriques à votre système de monitoring
      this.recordMetrics(metrics);

      return result;
    } catch (error) {
      // Enregistrer les erreurs
      this.recordError(error, { filename, codeLength: code.length });
      throw error;
    }
  }

  private estimateTokens(text: string): number {
    // Estimation simple : 1 token ≈ 4 caractères
    return Math.ceil(text.length / 4);
  }

  private recordMetrics(metrics: AIMetrics) {
    // Implémenter l'envoi vers Prometheus, DataDog, etc.
    console.log("AI Metrics:", metrics);
  }

  private recordError(error: Error, context: any) {
    // Implémenter la journalisation d'erreur
    console.error("AI Service Error:", error, context);
  }
}
```

### Rollback et Migration Progressive

#### Configuration de fallback

```typescript
export class FallbackAIService implements AIService {
  constructor(
    private primaryService: AIService,
    private fallbackService: AIService
  ) {}

  async analyzeCode(filename: string, code: string): Promise<AIAnalysisResult> {
    try {
      return await this.primaryService.analyzeCode(filename, code);
    } catch (error) {
      console.warn(
        `Primary AI service failed, falling back to backup: ${error.message}`
      );
      return await this.fallbackService.analyzeCode(filename, code);
    }
  }
}

// Utilisation
const aiService = new FallbackAIService(
  new OllamaService(),
  new AnthropicService(ANTHROPIC_API_KEY!)
);
```

### Coûts et Performance

#### Comparaison des coûts

- **Anthropic Claude Sonnet 4** : ~$0.15/1M tokens input, ~$0.60/1M tokens output
- **Ollama (on-premise)** : Coût initial du serveur + électricité
- **LM Studio** : Gratuit, coût du serveur

#### Estimation des ressources

- **Modèle 3B** : 4-8GB RAM, CPU uniquement
- **Modèle 8B** : 8-16GB RAM, GPU recommandé
- **Modèle 70B** : 32GB+ RAM, GPU requis

### Sécurité et Conformité

#### Avantages de l'on-premise

- Aucune donnée envoyée à des tiers
- Conformité RGPD/GDPR
- Contrôle total sur l'infrastructure
- Pas de dépendance aux API externes

#### Considérations

- Maintenance des modèles
- Mises à jour de sécurité
- Sauvegarde des modèles
- Monitoring des performances

### Conclusion

La migration vers une solution on-premise offre :

1. **Contrôle total** sur l'infrastructure IA
2. **Réduction des coûts** à long terme
3. **Conformité** aux exigences de sécurité
4. **Indépendance** des fournisseurs cloud

**Recommandation :** Commencer avec Ollama pour sa simplicité, puis évoluer vers vLLM pour la production si les performances le justifient.
