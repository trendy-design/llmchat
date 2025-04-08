import moment from 'moment';
import { customAlphabet } from 'nanoid';

export const getRelativeDate = (date: string | Date) => {
  const today = moment().startOf('day');
  const inputDate = moment(date).startOf('day');

  const diffDays = today.diff(inputDate, 'days');

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  return inputDate.format('DD/MM/YYYY');
};

export function formatNumber(number: number) {
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(0)}M`;
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(0)}K`;
  }
  return number.toString();
}

export function removeExtraSpaces(str?: string) {
  return str?.trim().replace(/\n{3,}/g, '\n\n');
}

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const convertFileToBase64 = (file: File, onChange: (base64: string) => void): void => {
  if (!file) {
    alert('Please select a file!');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event: ProgressEvent<FileReader>) => {
    const base64String = event.target?.result as string;
    onChange(base64String);
  };

  reader.onerror = (error: ProgressEvent<FileReader>) => {
    console.error('Error: ', error);
    alert('Error reading file!');
  };

  reader.readAsDataURL(file);
};

export function generateAndDownloadJson(data: any, filename: string) {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const base64Url = `data:${response.headers.get('Content-Type')};base64,${
        base64String.split(',')[1]
      }`;
      resolve(base64Url);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(blob);
  });
}

export function generateShortUUID() {
  const nanoid = customAlphabet('1234567890abcdef', 12);
  return nanoid();
}

export const formatTickerTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
