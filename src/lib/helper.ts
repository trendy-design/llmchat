import { TChatMessage, TChatSession } from "@/hooks/use-chat-session";
import moment from "moment";

export function formatNumber(number: number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(0) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(0) + "K";
  } else {
    return number.toString();
  }
}

export function removeExtraSpaces(str?: string) {
  str = str?.trim();
  str = str?.replace(/\n{3,}/g, "\n\n");
  return str;
}

export const sortSessions = (
  sessions: TChatSession[],
  sortBy: "createdAt" | "updatedAt"
) => {
  return sessions.sort((a, b) => moment(b[sortBy]).diff(moment(a[sortBy])));
};

export const sortMessages = (messages: TChatMessage[], sortBy: "createdAt") => {
  return messages.sort((a, b) => moment(a[sortBy]).diff(moment(b[sortBy])));
};

export const convertFileToBase64 = (
  file: File,
  onChange: (base64: string) => void
): void => {
  if (!file) {
    alert("Please select a file!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const base64String = event.target?.result as string;
    onChange(base64String);
  };

  reader.onerror = (error: ProgressEvent<FileReader>) => {
    console.error("Error: ", error);
    alert("Error reading file!");
  };

  reader.readAsDataURL(file);
};

export function generateAndDownloadJson(data: any, filename: string) {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
