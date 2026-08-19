/**
 * NexusMatrix 768-Dimensional Vector Embedding Generator
 * Generates unit-length normalized 768-D vectors for semantic vector DB ops & similarity queries.
 */

export function generate768DEmbedding(text: string): number[] {
  const DIMENSIONS = 768;
  const vector = new Array(DIMENSIONS).fill(0);
  const cleanText = text.toLowerCase().trim();

  if (!cleanText) {
    return normalizeVector(vector);
  }

  // 1. Character n-gram & word hashing across 768 dimensions
  for (let i = 0; i < cleanText.length; i++) {
    const charCode = cleanText.charCodeAt(i);
    const pos1 = (charCode * 31 + i * 17) % DIMENSIONS;
    const pos2 = (charCode * 59 + i * 37) % DIMENSIONS;
    const pos3 = (charCode * 97 + i * 83) % DIMENSIONS;

    vector[pos1] += Math.sin(charCode + i) * 0.45;
    vector[pos2] += Math.cos(charCode * 2 + i) * 0.35;
    vector[pos3] += Math.tan(charCode + 0.1) * 0.2;
  }

  // 2. High-level Semantic Topic Cluster Signals
  const topicKeywords: Record<string, number[]> = {
    code: [10, 45, 120, 310, 512, 700],
    vision: [22, 90, 210, 415, 600, 750],
    logic: [5, 60, 180, 390, 580, 710],
    summarize: [15, 75, 195, 400, 620, 730],
    guardrail: [30, 110, 240, 450, 660, 760],
    synthesis: [40, 130, 270, 480, 680, 740],
    architecture: [8, 50, 150, 330, 540, 690],
  };

  for (const [topic, indices] of Object.entries(topicKeywords)) {
    if (cleanText.includes(topic)) {
      for (const idx of indices) {
        vector[idx] += 2.5;
        vector[(idx + 1) % DIMENSIONS] += 1.8;
        vector[(idx + 2) % DIMENSIONS] += 1.2;
      }
    }
  }

  // 3. Word frequency hashing
  const words = cleanText.split(/\s+/);
  words.forEach((word, wIdx) => {
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const dim = Math.abs(hash) % DIMENSIONS;
    vector[dim] += (wIdx + 1) * 0.15;
  });

  return normalizeVector(vector);
}

/**
 * L2 Normalization so dot product equals Cosine Similarity
 */
export function normalizeVector(vec: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((val) => val / norm);
}

/**
 * Computes Cosine Similarity between two 768-D vectors
 * Formula: (A · B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vector length mismatch: ${vecA.length} vs ${vecB.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  // Bound strictly between -1 and 1
  const similarity = dotProduct / denominator;
  return Math.min(1.0, Math.max(-1.0, similarity));
}

/**
 * Dimensionality reduction for 2D visual scatter map projection (PCA/t-SNE approximation)
 */
export function projectTo2DSpace(vec: number[]): [number, number] {
  if (vec.length < 768) return [0, 0];

  // Project using first 384 vs second 384 weighted harmonic frequencies
  let xSum = 0;
  let ySum = 0;

  for (let i = 0; i < 384; i++) {
    xSum += vec[i] * Math.cos((i * Math.PI) / 192);
    ySum += vec[i] * Math.sin((i * Math.PI) / 192);
  }
  for (let i = 384; i < 768; i++) {
    xSum += vec[i] * Math.sin(((i - 384) * Math.PI) / 192);
    ySum += vec[i] * Math.cos(((i - 384) * Math.PI) / 192);
  }

  // Scale into [-0.85, 0.85] bounds
  const x = Math.max(-0.85, Math.min(0.85, xSum * 1.5));
  const y = Math.max(-0.85, Math.min(0.85, ySum * 1.5));

  return [parseFloat(x.toFixed(4)), parseFloat(y.toFixed(4))];
}
