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
  str = str?.replace(/\n{2,}/g, "\n");
  return str;
}
