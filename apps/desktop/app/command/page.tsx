'use client';
import { ChatEditor } from '@repo/common/components';
import { useBroadcast } from '@repo/common/electron';
import { useChatEditor } from '@repo/common/hooks';
import { Button } from '@repo/ui';
import { ArrowUp } from 'lucide-react';
import { useState } from 'react';

export default function CommandPage() {
    const [text, setText] = useState('');
    const { editor } = useChatEditor({
        placeholder: 'Ask anything...',
        onBlur: props => {},
    });

    const sendMessage = useBroadcast(msg => {
        console.log('msg', msg);
    }, 'llm-chat');

    // useEffect(() => {
    //     console.log('electron', window.electronAPI.window.hide());
    // }, []);

    return (
        <div className="fixed inset-0 flex p-4">
            {text && <p>{text}</p>}
            <ChatEditor
                editor={editor}
                className="flex-1"
                sendMessage={() => {
                    sendMessage({ query: editor?.getText() });
                    window.electronAPI.window.hideCommand();
                }}
            />
            <Button
                variant={editor && editor?.getText()?.length > 0 ? 'default' : 'ghost'}
                size="icon-sm"
            >
                <ArrowUp size={20} />
            </Button>
        </div>
    );
}
