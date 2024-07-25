import { Extension } from "@tiptap/react";

export const ShiftEnterToLineBreak = Extension.create({
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": (_) => {
        return _.editor.commands.enter();
      },
    };
  },
});

export const DisableEnter = Extension.create({
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
    };
  },
});
