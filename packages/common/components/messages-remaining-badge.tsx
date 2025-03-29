import { useChatStore } from '#store/chat.store';
import { useAuth } from '@clerk/nextjs';
export function MessagesRemainingBadge() {
    const { actor } = useAuth();
    const creditLimit = useChatStore(state => state.creditLimit);

    if (!creditLimit.isFetched || !actor) {
        return (
            <div className="text-xs text-yellow-900/80">
                <span>deep.new</span>
            </div>
        );
    }

    return (
        <div className="text-xs text-yellow-900/80">
            You have {creditLimit.remaining} credits left today.{' '}
            {!creditLimit.isAuthenticated && (
                <span className="cursor-pointer font-medium text-yellow-900 underline">
                    Sign in
                </span>
            )}{' '}
            to get more credits or
            <span className="cursor-pointer pl-1 font-medium text-yellow-900 underline">
                <span>Upgrade your plan</span>
            </span>
        </div>
    );
}
