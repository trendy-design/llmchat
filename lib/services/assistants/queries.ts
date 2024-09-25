import { TCustomAssistant } from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assistantService } from "./client";

export const useAssistantsQueries = () => {
  const queryClient = useQueryClient();

  const assistantsQuery = useQuery({
    queryKey: ["custom-assistants"],
    queryFn: () => assistantService.getAllAssistant(),
  });

  const useOllamaModelsQuery = (baseUrl: string) =>
    useQuery({
      queryKey: ["ollama-models", baseUrl],
      queryFn: () => fetch(`${baseUrl}/api/tags`).then((res) => res.json()),
      enabled: !!baseUrl,
    });

  const createAssistantMutation = useMutation({
    mutationFn: (assistant: TCustomAssistant) =>
      assistantService.createAssistant(assistant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-assistants"] });
      assistantsQuery.refetch();
    },
  });

  const updateAssistantMutation = useMutation({
    mutationFn: ({
      key,
      assistant,
    }: {
      key: string;
      assistant: Partial<Omit<TCustomAssistant, "key">>;
    }) => assistantService.updateAssistant(key, assistant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-assistants"] });
      assistantsQuery.refetch();
    },
  });

  const removeAssistantMutation = useMutation({
    mutationFn: async (key: string) => {
      await assistantService.removeAssistant(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-assistants"] });
      assistantsQuery.refetch();
    },
  });

  const addAssistantsMutation = useMutation({
    mutationFn: (assistants: TCustomAssistant[]) =>
      assistantService.addAssistants(assistants),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-assistants"] });
      assistantsQuery.refetch();
    },
  });
  return {
    assistantsQuery,
    useOllamaModelsQuery,
    createAssistantMutation,
    updateAssistantMutation,
    removeAssistantMutation,
  };
};
