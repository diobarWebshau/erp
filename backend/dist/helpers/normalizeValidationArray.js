const normalizeValidationArray = (val) => {
    if (!val)
        return [];
    return Array.isArray(val) ? val : [val];
};
export { normalizeValidationArray };
