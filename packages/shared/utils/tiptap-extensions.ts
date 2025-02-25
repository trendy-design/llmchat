import { Extension } from '@tiptap/react';

export const ShiftEnterToLineBreak = Extension.create({
  name: 'shiftEnterToLineBreak',
  addKeyboardShortcuts() {
    return {
      'Shift-Enter': _ => {
        return _.editor.commands.enter();
      },
    };
  },
});

export const DisableEnter = Extension.create({
  name: 'disableEnter',
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
    };
  },
});
