import { ModelEnum } from '../models';
import { CompletionMode } from './deep';

/**
 * Maps a CompletionMode to the appropriate ModelEnum
 */
export const getModeModel = (mode: CompletionMode): ModelEnum => {
  switch (mode) {
    case CompletionMode.Fast:
      return ModelEnum.GPT_4o_Mini;
    case CompletionMode.Deep:
      return ModelEnum.Deepseek_R1;
    case CompletionMode.GPT_4o_Mini:
      return ModelEnum.GPT_4o_Mini;
    case CompletionMode.GEMINI_2_FLASH:
      return ModelEnum.GEMINI_2_FLASH;
    default:
      return ModelEnum.GPT_4o_Mini;
  }
}; 