import { TAssistant } from "@/lib/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { assistantService } from "./client";

export const useAssistantsQueries = () => {
  const assistantsQuery = useQuery({
    queryKey: ["assistants"],
    queryFn: () => assistantService.getAssistants(),
  });

  const createAssistantMutation = useMutation({
    mutationFn: (assistant: Omit<TAssistant, "key">) =>
      assistantService.createAssistant(assistant),
    onSuccess: () => {
      assistantsQuery.refetch();
    },
  });

  const deleteAssistantMutation = useMutation({
    mutationFn: (assistantKey: string) =>
      assistantService.deleteAssistant(assistantKey),
    onSuccess: () => {
      assistantsQuery.refetch();
    },
  });

  const updateAssistantMutation = useMutation({
    mutationFn: ({
      assistantKey,
      newAssistant,
    }: {
      assistantKey: string;
      newAssistant: Omit<TAssistant, "key">;
    }) => assistantService.updateAssistant(assistantKey, newAssistant),
    onSuccess: () => {
      assistantsQuery.refetch();
    },
  });

  const useOllamaModelsQuery = (baseUrl: string) =>
    useQuery({
      queryKey: ["ollama-models", baseUrl],
      queryFn: () => fetch(`${baseUrl}/api/tags`).then((res) => res.json()),
      enabled: !!baseUrl,
    });
  return {
    assistantsQuery,
    createAssistantMutation,
    updateAssistantMutation,
    deleteAssistantMutation,
    useOllamaModelsQuery,
  };
};
