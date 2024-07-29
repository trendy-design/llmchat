import { promptsService } from "@/services/prompts/client";
import { TPrompt } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";

export const usePromptsQueries = () => {
  const promptsQuery = useQuery({
    queryKey: ["prompts"],
    queryFn: () => promptsService.getPrompts(),
  });

  const createPromptMutation = useMutation({
    mutationFn: (prompt: Omit<TPrompt, "id">) =>
      promptsService.setPrompt(prompt),
    onSuccess: () => {
      promptsQuery.refetch();
    },
  });

  const updatePromptMutation = useMutation({
    mutationFn: ({
      id,
      prompt,
    }: {
      id: string;
      prompt: Partial<Omit<TPrompt, "id">>;
    }) => promptsService.updatePrompt(id, prompt),
    onSuccess: () => {
      promptsQuery.refetch();
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: (id: string) => promptsService.deletePrompt(id),
    onSuccess: () => {
      promptsQuery.refetch();
    },
  });

  return {
    promptsQuery,
    createPromptMutation,
    updatePromptMutation,
    deletePromptMutation,
  };
};
