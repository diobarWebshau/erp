export const useViewTransition = () => {
    const startViewTransition = (callback?: () => void): Promise<void> => {
        if (!document.startViewTransition) {
            callback?.();
            return Promise.resolve();
        }
 
        return new Promise<void>((resolve) => {
            // 
            const transition = document.startViewTransition(() => {
                callback?.();
            });
 
            transition.finished.then(() => {
                resolve();
            }).catch(() => {
                resolve();
            });
        });
    };
 
    return { startViewTransition };
};


// ? startViewTransaction
