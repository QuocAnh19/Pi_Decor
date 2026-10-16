import { request, authRequest } from "../http";
import type {
  StudioAssetRow,
  StudioSlotDefinitionRow,
  StudioSlotRuleRow,
  StudioTemplatePublishPayload,
  StudioTemplateRow,
} from "../types";

export const studioApi = {
  getStudioTemplates: () => request<StudioTemplateRow[]>("/studio/templates"),

  getStudioTemplatesAdmin: () => authRequest<StudioTemplateRow[]>("/studio/templates/admin"),

  publishStudioTemplate: (id: string, payload: StudioTemplatePublishPayload) =>
    authRequest<{ message: string; template: StudioTemplateRow }>(
      `/studio/templates/${id}/publish`,
      { method: "PUT", body: JSON.stringify(payload) }
    ),

  updateStudioTemplate: (id: string, payload: Partial<StudioTemplateRow>) =>
    authRequest<StudioTemplateRow>(`/studio/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  deleteStudioTemplate: (id: string) =>
    authRequest<void>(`/studio/templates/${id}`, { method: "DELETE" }),

  getStudioSlotDefinitions: (templateId: string) =>
    request<StudioSlotDefinitionRow[]>(`/studio/templates/${templateId}/slots`),

  deleteStudioSlotDefinition: (slotId: string) =>
    authRequest<void>(`/studio/slots/${slotId}`, { method: "DELETE" }),

  getStudioAssetsAdmin: () => authRequest<StudioAssetRow[]>("/studio/assets/admin"),

  getStudioSlotRules: (templateId: string) =>
    request<StudioSlotRuleRow[]>(`/studio/templates/${templateId}/rules`),
};
