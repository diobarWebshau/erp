const normalizeValidationArray = (val: string | string[] | undefined | null): string[] => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
};

export { normalizeValidationArray };
