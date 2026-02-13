
import { GoogleGenAI, Type } from "@google/genai";
import { ProjectAnalysis } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    nameSuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          seoScore: { type: Type.NUMBER },
          reasoning: { type: Type.STRING }
        },
        required: ["name", "type", "seoScore", "reasoning"]
      }
    },
    description: {
      type: Type.OBJECT,
      properties: {
        short: { type: Type.STRING },
        extended: { type: Type.STRING },
        seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["short", "extended", "seoKeywords"]
    },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    readme: { type: Type.STRING },
    techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
    viralHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
    review: { type: Type.STRING },
    versioningStrategy: { type: Type.STRING },
    documentation: {
      type: Type.OBJECT,
      properties: {
        apiReference: { type: Type.STRING },
        usageExamples: { type: Type.STRING },
        installationGuide: { type: Type.STRING }
      },
      required: ["apiReference", "usageExamples", "installationGuide"]
    },
    gitignore: { type: Type.STRING }
  },
  required: [
    "nameSuggestions", "description", "tags", "readme", "techStack", 
    "viralHooks", "review", "versioningStrategy", "documentation", "gitignore"
  ]
};

export const analyzeProject = async (projectSummary: string): Promise<ProjectAnalysis> => {
  // Always create a new instance right before use to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this project context for maximum GitHub virality and professional quality.
    1. Provide exactly 5 diverse name suggestions with SEO scoring.
    2. Write a professional README with an "AI Review" section embedded.
    3. Generate a highly specific .gitignore based on the detected tech stack.
    4. Provide detailed documentation: API Reference, Usage Examples, and Installation Guide.
    5. Define a versioning strategy.
    
    PROJECT CONTEXT:
    ${projectSummary}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI analysis returned empty content.");
  return JSON.parse(text) as ProjectAnalysis;
};

export const generateProjectPreviewImage = async (
  analysis: ProjectAnalysis, 
  options: { resolution?: '1K' | '2K' | '4K', style?: string } = {}
): Promise<string> => {
  const prompt = `Create a high-impact, futuristic social media preview card for a GitHub project.
  Project Name: ${analysis.nameSuggestions[0].name}
  Tagline: ${analysis.description.short}
  Technologies: ${analysis.techStack.join(', ')}
  Visual Style: ${options.style || 'Hyper-realistic, Cyberpunk, minimalist, high contrast neon green and charcoal colors'}.
  Composition: Central text with technical nodes orbiting. 4K detail.`;

  try {
    // Always create a new instance right before use for pro models as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { 
          aspectRatio: "16:9",
          imageSize: options.resolution || "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image part found in response.");
  } catch (error: any) {
    // Per guidelines: prompt for key again if entity not found (usually means key/project issue)
    if (error.message?.includes("Requested entity was not found.") && (window as any).aistudio) {
      (window as any).aistudio.openSelectKey();
    }
    console.error("AI Media generation failed. Using fallback generation.", error);
    // Return a high-quality stylized SVG fallback
    const svg = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#0d1117"/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#238636;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2ea043;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="1100" cy="100" r="150" fill="url(#grad)" opacity="0.1" />
        <text x="50%" y="45%" font-family="Inter, sans-serif" font-weight="900" font-size="80" fill="#f0f6fc" text-anchor="middle">
          ${analysis.nameSuggestions[0].name.toUpperCase()}
        </text>
        <text x="50%" y="55%" font-family="Inter, sans-serif" font-weight="400" font-size="30" fill="#8b949e" text-anchor="middle">
          ${analysis.description.short}
        </text>
        <rect x="50" y="580" width="1100" height="2" fill="#238636" opacity="0.5" />
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }
};
