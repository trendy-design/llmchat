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
