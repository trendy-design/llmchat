export const ErrorPlaceholder = () => {
    return (
        <div className="border-border flex w-full flex-col items-center justify-center rounded-lg border border-dashed p-4">
            <div className="text-muted-foreground/70 text-sm">
                Sorry, something went wrong. Please try again.
            </div>
        </div>
    );
};
