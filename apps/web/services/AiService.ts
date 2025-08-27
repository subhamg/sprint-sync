import { http } from "../lib/http";

export interface AiPriority {
  taskId: string;
  title: string;
  reason: string;
}
export interface AiBlock {
  label: string;
  focus: string;
}
export interface AiPlanResponse {
  summary: string;
  priorities: AiPriority[];
  blocks: AiBlock[];
}

export class AiService {
  async suggest(): Promise<AiPlanResponse> {
    const { data } = await http.post<AiPlanResponse>("/ai/suggest");
    return data;
  }
}

export const aiService = new AiService();
