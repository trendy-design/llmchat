import { DisableEnter, ShiftEnterToLineBreak } from '@repo/shared/utils';
import CharacterCount from '@tiptap/extension-character-count';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Highlight } from '@tiptap/extension-highlight';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Text } from '@tiptap/extension-text';

import { useEditor } from '@tiptap/react';
import { useEffect } from 'react';
import { useChatStore } from '../store';

export const useChatEditor = (editorProps: { defaultContent?: string }) => {
    const setEditor = useChatStore(state => state.setEditor);
    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Placeholder.configure({
                placeholder: 'Ask anything',
            }),
            CharacterCount.configure({
                limit: 400000,
            }),
            ShiftEnterToLineBreak,
            Highlight.configure({
                HTMLAttributes: {
                    class: 'prompt-highlight',
                },
            }),
            HardBreak,
            DisableEnter,
        ],
        immediatelyRender: false,
        content: '',
        autofocus: true,
        onTransaction(props) {
            const { editor } = props;
            const text = editor.getText();
            const html = editor.getHTML();
            if (text === '/') {
                // setOpenPromptsBotCombo(true);
            } else {
                const newHTML = html.replace(/::((?:(?!::).)+)::/g, (_, content) => {
                    return ` <mark class="prompt-highlight">${content}</mark> `;
                });

                if (newHTML !== html) {
                    editor.commands.setContent(newHTML, true, {
                        preserveWhitespace: true,
                    });
                }
                // setOpenPromptsBotCombo(false);
            }
        },
        onCreate(props) {
            if (editorProps?.defaultContent) {
                props.editor.commands.setContent(editorProps?.defaultContent || '', true, {
                    preserveWhitespace: true,
                });
            }
        },

        parseOptions: {
            preserveWhitespace: 'full',
        },
    });

    useEffect(() => {
        setEditor(editor);
    }, [editor]);

    useEffect(() => {
        if (editor) {
            editor.commands.focus('end');
        }
    }, [editor]);

    return {
        editor,
    };
};
