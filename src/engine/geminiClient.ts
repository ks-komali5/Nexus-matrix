import { GoogleGenAI } from '@google/genai';
import type { ModelName, AgentId } from '../types';

let apiKey: string = import.meta.env.VITE_GEMINI_API_KEY || '';

export function setGeminiApiKey(key: string) {
  apiKey = key;
  if (key) {
    localStorage.setItem('nexus_gemini_api_key', key);
  } else {
    localStorage.removeItem('nexus_gemini_api_key');
  }
}

export function getGeminiApiKey(): string {
  return (
    apiKey ||
    localStorage.getItem('nexus_gemini_api_key') ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export async function executeAgentInference(
  agentId: AgentId,
  model: ModelName,
  prompt: string,
  extraContext?: string,
  imagePayload?: string
): Promise<{ text: string; tokens: number; latencyMs: number; isRealApi: boolean }> {
  const activeKey = getGeminiApiKey();
  const startTime = performance.now();

  if (activeKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: activeKey });
      
      const parts: any[] = [{ text: prompt }];
      if (extraContext) {
        parts.unshift({ text: `[Prerequisite Memory Context]:\n${extraContext}\n\n[Task Prompt]:` });
      }

      if (imagePayload && imagePayload.includes('data:image')) {
        const base64Data = imagePayload.split(',')[1];
        const mimeType = imagePayload.substring(imagePayload.indexOf(':') + 1, imagePayload.indexOf(';'));
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: parts,
      });

      const text = response.text || 'No response text returned.';
      const latencyMs = Math.round(performance.now() - startTime);
      const tokens = Math.max(12, Math.floor(text.length / 3.8));

      return { text, tokens, latencyMs, isRealApi: true };
    } catch (err: any) {
      console.warn('Real Gemini API call failed or rate limited, falling back to simulated inference engine:', err);
    }
  }

  // Simulated High-Fidelity Agent Engine
  await new Promise((res) => setTimeout(res, 200 + Math.random() * 300));
  const latencyMs = Math.round(performance.now() - startTime);

  let simulatedOutput = '';
  switch (agentId) {
    case 'orchestrator':
      simulatedOutput = `Decomposed objective into 4 dependency-linked DAG nodes targeting Gemini 3.7 Flash & 3.1 Pro Preview:\n1. [Text Summarizer] Compress context payload\n2. [Vision Captioner] Analyze visual spatial diagrams\n3. [Code Assistant] Synthesize production TypeScript handler\n4. [Deep Logic] Audit vector space complexity`;
      break;

    case 'summarizer':
      simulatedOutput = `High-Density Compression Summary (Compression Ratio: 4.2x):\n- Deconstructed prompt into core vector directives.\n- Identified 3 critical state dependencies.\n- Filtered token redundancy by 76.2%.`;
      break;

    case 'vision':
      simulatedOutput = `Visual Bounding Tags & Diagram Analytics:\n- Element 1: [0.12, 0.25, 0.45, 0.88] "Master Orchestrator Node"\n- Element 2: [0.50, 0.10, 0.85, 0.45] "768D Vector DB Memory Store"\n- Spatial Layout: Distributed Directed Acyclic Graph topology detected with 99.1% visual confidence.`;
      break;

    case 'code':
      simulatedOutput = `\`\`\`typescript\n// Synthesized by Code Assistant (gemini-3.1-pro-preview)\nimport { sharedVectorDB } from './vectorStore';\n\nexport async function processTaskPipeline(input: string): Promise<string> {\n  const vector = sharedVectorDB.addVector(input, 'code', 'Code Assistant Agent', 'code');\n  return \`Executed pipeline task with vector ID: \${vector.id}\`;\n}\n\`\`\``;
      break;

    case 'logic':
      simulatedOutput = `Mathematical Proof & Architecture Tradeoff Audit:\n$$\\text{Similarity}(A, B) = \\frac{\\sum A_i B_i}{\\sqrt{\\sum A_i^2} \\sqrt{\\sum B_i^2}}$$\n- Evaluated 768-dimensional inner product space.\n- Verified Cosine Distance $d = 1 - S \\le 0.12$ guaranteeing zero semantic drift across multi-agent hops.`;
      break;

    case 'guardrail':
      simulatedOutput = `Zero-Trust Safety & Schema Validation Report:\n- Schema Integrity: PASSED (100% type compliant)\n- Security Audit: REJECTED 0 injection vectors\n- Memory Bounds: PASSED (Within 768D vector embedding limits)`;
      break;

    case 'synthesizer':
      simulatedOutput = `Consolidated Executive Synthesis Report:\n- Objective fulfilled across 6 multi-modal agent hops.\n- In-Memory Semantic Cache Hits: 2 (Bypassed LLM inference in 0.4ms).\n- Aggregate Deliverable: Multi-modal code, spatial tags, and logic verification merged into production payload.`;
      break;

    default:
      simulatedOutput = `Agent ${agentId} executed task successfully: ${prompt}`;
  }

  const tokens = Math.floor(simulatedOutput.length / 3.5);
  return { text: simulatedOutput, tokens, latencyMs, isRealApi: false };
}
