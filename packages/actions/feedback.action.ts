'use server';

import { auth } from '@clerk/nextjs/server';

export const submitFeedback = async (feedback: string) => {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
        return { error: 'Unauthorized' };
    }

    return feedback;
};
