import { Mark } from "@tiptap/react";
export const spanMark = Mark.create({
  name: "span",
  defaultOptions: {
    class: "some-class",
  },
  parseHTML() {
    return [
      {
        tag: "span",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },
});
