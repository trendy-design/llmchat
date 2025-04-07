import { MotionSkeleton } from '@repo/common/components';

export default function Loading() {
    return (
        <div className="no-scrollbar flex w-full flex-1 flex-col items-center overflow-y-auto px-8">
            <div className="mx-auto w-full max-w-3xl px-4 pb-[200px] pt-16">
                <div className="flex w-full flex-col items-start gap-2 opacity-10">
                    <MotionSkeleton className="bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-sm" />
                    <MotionSkeleton className="w-full bg-gradient-to-r" />
                    <MotionSkeleton className="w-[70%] bg-gradient-to-r" />
                    <MotionSkeleton className="w-[50%] bg-gradient-to-r" />
                </div>
            </div>
        </div>
    );
}
