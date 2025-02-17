import moment from 'moment';

const presetValues = {
  '{{local_date}}': moment().format('YYYY-MM-DD'),
  '{{local_time}}': moment().format('HH:mm:ss'),
  '{{local_datetime}}': moment().format('YYYY-MM-DD HH:mm:ss'),
};

export const injectPresetValues = (prompt: string) => {
  return prompt.replace(
    /{{.*?}}/g,
    (match) => presetValues?.[match as keyof typeof presetValues] || match
  );
};
