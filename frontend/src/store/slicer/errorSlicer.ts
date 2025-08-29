import {
    createSlice, type PayloadAction
} from "@reduxjs/toolkit";

type Object = {
    validation: string | string[] | null;
}

type ErrorState = {
    [key: string]: string | string[] | null;
};

const initialState: ErrorState = {};

const errorsSlice = createSlice({
    name: 'errors',
    initialState,
    reducers: {
        setError: (state, action: PayloadAction<{ key: string; message: Object }>) => {
            const { key, message } = action.payload;
            state[key] = message.validation;
        },
        clearError: (state, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
        clearAllErrors: () => ({}),
    },
});

const { setError, clearError, clearAllErrors } = errorsSlice.actions;

export {
    setError,
    clearError,
    clearAllErrors
}

export default errorsSlice;
