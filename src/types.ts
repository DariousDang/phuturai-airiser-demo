export type Evidence = {
  lineStart: number;
  lineEnd: number;
  quote: string;
};

export type CitedItem = {
  text: string;
  evidence: Evidence;
};

export type ActionItem = {
  task: string;
  owner: string;
  deadline: string;
  evidence: Evidence;
};

export type Analysis = {
  title: string;
  summary: string;
  decisions: CitedItem[];
  actions: ActionItem[];
  facts: CitedItem[];
  risks: CitedItem[];
  meta: {
    mode: "ollama" | "gemini" | "demo";
    model: string;
    lineCount: number;
  };
};

export type Answer = {
  answer: string;
  confidence: "grounded" | "partial" | "not_found";
  citations: Evidence[];
  meta: {
    mode: "ollama" | "gemini" | "demo";
    model: string;
  };
};

export type ProviderStatus = {
  provider: "ollama" | "gemini" | "demo";
  model: string;
  ready: boolean;
  privacy: "local" | "hosted" | "rehearsal";
};
