import { useAuth } from '@clerk/nextjs';
import { useChatStore } from '../store/chat.store';

export const useCredits = () => {
    const fetchRemainingCredits = useChatStore(state => state.fetchRemainingCredits);
    const { getToken } = useAuth();

    const fetchCredits = async () => {
        const token = await getToken();
        if (!token) return;
        await fetchRemainingCredits(token);
    };

    return {
        fetchCredits,
    };
};
