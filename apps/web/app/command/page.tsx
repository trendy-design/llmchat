'use client';
import { ChatEditor } from '@repo/common/components';
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

    return (
        <div className="fixed inset-0 flex p-4">
            {text && <p>{text}</p>}
            <ChatEditor editor={editor} className="flex-1" sendMessage={() => {}} />
            <Button
                variant={editor && editor?.getText()?.length > 0 ? 'default' : 'ghost'}
                size="icon-sm"
            >
                <ArrowUp size={20} />
            </Button>
        </div>
    );
}
