export const generateErrorMessage = (error: Error | string) => {
    if (error instanceof Error) {
        console.log('errorjjj', error.message);
        if (error.message.includes('429')) {
            return 'You have reached the limit of requests per minute. Please try again later.';
        }

        if (error.message.includes('401')) {
            return 'You are not authorized to access this resource. Please try again.';
        }

        if (error.message.includes('403')) {
            return 'You are not authorized to access this resource. Please try again.';
        }

        if (error.message.toLowerCase().includes('timeout')) {
            return 'The request timed out. Please try again.';
        }

        console.log('errorkkk', error.message.toLowerCase());
        if (
            error.message.toLowerCase().includes('api') &&
            error.message.toLowerCase().includes('key')
        ) {
            console.log('api key error');
            return 'The API key is invalid. Please try again.';
        }

        return 'Something went wrong. Please try again later.';
    }

    return 'Something went wrong. Please try again later.';
};
