
import { CodeReviewResult, CodeRewriteResult, TerminalOutput, ChatMessage } from "../types";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Generic fetch wrapper for Groq API with streaming support.
 */
async function callGroqStream(
  messages: any[],
  onChunk: (text: string) => void,
  model: string = "llama-3.3-70b-versatile",
  jsonMode: boolean = false
): Promise<string> {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Groq API Error");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices[0]?.delta?.content || "";
            fullText += content;
            onChunk(fullText);
          } catch (e) {
            continue;
          }
        }
      }
    }
  }

  return fullText;
}

export const analyzeCode = async (
  code: string, 
  language: string, 
  focus: string[],
  onChunk: (text: string) => void
): Promise<CodeReviewResult> => {
  const systemInstruction = `You are an Expert Code Reviewer. Analyze the code focusing on: ${focus.join(', ')}.
    CRITICAL: You MUST use these exact markdown headers:
    ### Critical Issues
    ### High Priority
    ### Medium Priority
    ### Low Priority
    Provide specific code examples where relevant. Use triple backticks for code blocks.`;

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: `Language: ${language}\n\nCODE:\n${code}` }
  ];

  const fullText = await callGroqStream(messages, onChunk);

  const getCount = (header: string) => {
    const section = fullText.match(new RegExp(`### ${header}[\\s\\S]*?(?=###|$)`, 'g'))?.[0];
    if (!section) return 0;
    return (section.match(/- /g) || []).length;
  };

  return {
    counts: {
      'Critical Issues': getCount('Critical Issues'),
      'High Priority': getCount('High Priority'),
      'Medium Priority': getCount('Medium Priority'),
      'Low Priority': getCount('Low Priority'),
    },
    markdown: fullText,
    suggestions: []
  };
};

export const rewriteCode = async (
  code: string, 
  language: string,
  onChunk: (text: string) => void
): Promise<CodeRewriteResult> => {
  const systemInstruction = `You are a Senior Principal Developer. Refactor and optimize the provided code.
    Format your response as follows:
    Brief summary of improvements (bullet points).
    ---
    \`\`\`[language]
    [FULL REWRITTEN CODE]
    \`\`\``;

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: `Language: ${language}\n\nCODE:\n${code}` }
  ];

  const fullText = await callGroqStream(messages, onChunk);

  const parts = fullText.split('---');
  const summary = parts.length > 0 ? parts[0].trim() : "Code successfully optimized.";
  const codeMatch = fullText.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
  const rewrittenCode = codeMatch ? codeMatch[1].trim() : (parts.length > 1 ? parts[1].trim() : fullText.trim());

  return { 
    summary, 
    rewrittenCode,
    improvements: summary.split('\n').filter((l: string) => l.trim().length > 5).slice(0, 5),
    explanation: summary
  };
};

export const runSimulatedCode = async (code: string, language: string): Promise<TerminalOutput> => {
  const systemPrompt = `Simulate the execution of the code. 
    Return ONLY a JSON object with "stdout" and "stderr" keys. 
    
    SPECIAL HANDLING RULES:
    1. For CSS: "stdout" must be a complete, valid HTML document.
    2. For Programming Languages: "stdout" should contain the text output.
    Ensure NO text is returned outside the JSON structure.`;
    
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Language: ${language}\nCODE:\n${code}` }
  ];

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  const jsonStr = data.choices[0]?.message?.content || "{}";

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return { stdout: jsonStr, stderr: "" };
  }
};

export const chatWithAssistant = async (
  message: string, 
  currentCode: string, 
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> => {
  const messages = [
    { role: "system", content: `You are a helpful coding assistant. Working code context:\n${currentCode}` },
    ...history.map(m => ({
      role: m.role === "model" ? "assistant" : "user",
      content: m.text
    })),
    { role: "user", content: message }
  ];

  return await callGroqStream(messages, onChunk, "llama-3.1-8b-instant");
};
