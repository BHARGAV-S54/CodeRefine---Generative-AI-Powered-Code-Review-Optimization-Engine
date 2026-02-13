
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RewrittenResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const modelName = 'gemini-3-flash-preview';

export const detectLanguage = async (code: string): Promise<string> => {
  if (!code.trim() || code.length < 5) return 'auto';
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `You are a language detection expert. Identify the programming language of the following code snippet. 
      Return ONLY the lowercased name of the language (e.g. "javascript", "python", "typescript", "rust", "cpp"). 
      If unsure, return "auto".
      
      CODE:
      ${code}`,
    });
    const result = response.text?.trim().toLowerCase() || 'auto';
    return result.split('\n')[0].replace(/[^a-z+#]/g, '');
  } catch (error) {
    console.error("Language detection error:", error);
    return 'auto';
  }
};

export const reviewCode = async (code: string, language: string, focus: string[]): Promise<AnalysisResult> => {
  const focusAreas = focus.join(", ");
  const prompt = `
    Analyze this ${language} code as a senior security engineer and architect. 
    Focus specifically on: ${focusAreas}.
    
    You must structure your report using these markdown headers exactly:
    ### Critical Issues
    ### High Priority
    ### Medium Priority
    ### Low Priority
    
    Rules for response:
    - Use bullet points starting with "- " for each finding.
    - Be technical and provide clear code examples for fixes if needed.
    - If a category is empty, write "- No issues found."
    
    CODE TO ANALYZE:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert code auditor. Provide high-density technical analysis.",
      },
    });

    const text = response.text || "";
    
    const countBullets = (sectionTitle: string) => {
      const regex = new RegExp(`### ${sectionTitle}([\\s\\S]*?)(?=###|$)`, 'i');
      const match = text.match(regex);
      if (!match) return 0;
      const section = match[1];
      if (section.includes("No issues found")) return 0;
      const bullets = section.match(/^- /gm);
      return bullets ? bullets.length : 0;
    };

    return {
      critical: countBullets("Critical Issues"),
      high: countBullets("High Priority"),
      medium: countBullets("Medium Priority"),
      low: countBullets("Low Priority"),
      content: text,
    };
  } catch (error) {
    console.error("Code review error:", error);
    throw error;
  }
};

export const rewriteCode = async (code: string, language: string): Promise<RewrittenResult> => {
  const prompt = `
    Refactor this ${language} code for production use. 
    Your goal is to optimize performance, readability, and security.
    
    Provide two parts in your response:
    1. A concise strategy explanation (markdown).
    2. The fully refactored code wrapped in a markdown code block.
    
    CODE:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: "You are a lead software architect. Refactor code to meet modern industry standards.",
      },
    });

    const text = response.text || "";
    const codeMatch = text.match(/```[\s\S]*?\n([\s\S]*?)```/);
    const explanation = text.replace(/```[\s\S]*?```/g, '').trim();
    const rewrittenCode = codeMatch ? codeMatch[1].trim() : "Failed to generate optimized code.";

    return { explanation, code: rewrittenCode };
  } catch (error) {
    console.error("Rewrite code error:", error);
    throw error;
  }
};

export const simulateExecution = async (code: string, language: string): Promise<{ stdout: string; stderr: string; html?: string }> => {
  const prompt = `
    Simulate running this ${language} code. 
    - If it's code that produces console output (like Python/Java/Node), provide 'stdout' and 'stderr'.
    - If it's web-related code (HTML, CSS, JS snippets, React-like logic), create a self-contained 'html' property that renders a visual preview of what the code would do. Include necessary <style> or <script> tags in this 'html' string.
    
    Return a JSON object with keys: "stdout", "stderr", and "html" (optional).
    
    CODE:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stdout: { type: Type.STRING },
            stderr: { type: Type.STRING },
            html: { type: Type.STRING, description: "Full HTML content for a web preview, if applicable." },
          },
          required: ["stdout", "stderr"],
        },
      },
    });

    return JSON.parse(response.text || '{"stdout": "", "stderr": "Simulation failed."}');
  } catch (error) {
    console.error("Simulation error:", error);
    return { stdout: "", stderr: "Environment error: Simulation interrupted." };
  }
};

export const chatWithAssistant = async (message: string, history: { role: string; content: string }[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join("\n") + `\nUser: ${message}`,
      config: {
        systemInstruction: "You are CodeRev AI Assistant. Answer developer questions with precision and provide code examples in markdown.",
      },
    });
    return response.text || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    console.error("Assistant error:", error);
    return "The assistant service is temporarily unavailable.";
  }
};
