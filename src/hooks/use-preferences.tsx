import { get, set } from "idb-keyval";

export type TApiKeys = {
  openai?: string;
  anthropic?: string;
  gemini?: string;
};
export const usePreferences = () => {
  const getApiKeys = async (): Promise<TApiKeys> => {
    return (await get("api-keys")) || {};
  };

  const setApiKey = async (key: keyof TApiKeys, value: string) => {
    const keys = await getApiKeys();
    const newKeys = { ...keys, [key]: value };
    await set("api-keys", newKeys);
  };

  const getApiKey = async (key: keyof TApiKeys) => {
    const keys = await getApiKeys();
    return keys[key];
  };

  return { getApiKeys, setApiKey, getApiKey };
};
