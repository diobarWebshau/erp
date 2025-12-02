interface IApiError {
    status: number,
    message?: string,
    validation?: string[],
    code?: string
}

export type { IApiError }