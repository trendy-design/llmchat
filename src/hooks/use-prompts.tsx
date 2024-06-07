import { useMutation, useQuery } from "@tanstack/react-query";
import { get, set } from "idb-keyval";
import { v4 } from "uuid";

export type TPrompt = {
  id: string;
  name: string;
  content: string;
};

export const usePrompts = () => {
  const getPrompts = async (): Promise<TPrompt[]> => {
    return (await get("prompts")) || [];
  };

  const setPrompt = async (prompt: Omit<TPrompt, "id">): Promise<TPrompt[]> => {
    const prompts = await getPrompts();
    const newPrompts = [...prompts, { id: v4(), ...prompt }];
    await set("prompts", newPrompts);
    return newPrompts;
  };

  const updatePrompt = async (
    id: string,
    prompt: Partial<Omit<TPrompt, "id">>
  ): Promise<TPrompt[]> => {
    const prompts = await getPrompts();
    const newPrompts = prompts.map((p) =>
      p.id === id ? { ...p, ...prompt } : p
    );
    await set("prompts", newPrompts);
    return newPrompts;
  };

  const deletePrompt = async (id: string) => {
    const prompts = await getPrompts();
    const newPrompts = prompts?.filter((prompt) => prompt.id !== id) || [];
    await set("prompts", newPrompts);
  };

  const promptsQuery = useQuery({
    queryKey: ["prompts"],
    queryFn: getPrompts,
  });

  const createPromptMutation = useMutation({
    mutationFn: setPrompt,
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
    }) => updatePrompt(id, prompt),
    onSuccess: () => {
      promptsQuery.refetch();
    },
  });

  const deletePromptMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      promptsQuery.refetch();
    },
  });

  return {
    getPrompts,
    setPrompt,
    updatePrompt,
    promptsQuery,
    createPromptMutation,
    updatePromptMutation,
    deletePromptMutation,
  };
};
