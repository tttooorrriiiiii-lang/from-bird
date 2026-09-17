export type ToolSlug = "words" | "color" | "shape" | "story" | "think";
export type Work = { id: string; tool: ToolSlug; title: string; content: string; createdAt: string; tags?: string[]; colors?: string[] };
export type HistoryItem = { id: string; action: "SAVE" | "DELETE"; label: string; createdAt: string };
