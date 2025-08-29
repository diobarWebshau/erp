export function getChangedFields<T extends object>(
    complete: T,
    partial: Partial<T>
): Partial<T> {
    const changes: Partial<T> = {};

    for (const key in partial) {
        if (
            Object.prototype.hasOwnProperty.call(partial, key) &&
            partial[key] !== complete[key]
        ) {
            changes[key] = partial[key];
        }
    }

    return changes;
}