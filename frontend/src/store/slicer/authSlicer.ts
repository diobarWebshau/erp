import {
    createSlice, type PayloadAction
} from "@reduxjs/toolkit";


interface Auth {
    username: string | null,
    isAuthenticated: boolean | null,
    retryCount: number | null;
}

interface PayloadSlice {
    username: string
}

const defaultAuth: Auth = {
    username: null,
    isAuthenticated: null,
    retryCount: null
}

const authSlice = createSlice({
    name: "auth",
    initialState: defaultAuth,
    reducers: {
        removeAuth: (state) => {
            state.username = null;
            state.isAuthenticated = false
            state.retryCount = 0;
        },
        clearAuth: (state) => {
            state.isAuthenticated = null;
            state.retryCount = null;
        },
        incrementCount: (state) => {
            if (typeof state.retryCount === 'number') state.retryCount = state.retryCount + 1;
        },
        saveAuth: (state, action: PayloadAction<PayloadSlice>) => {
            state.username =
                action.payload.username;
            state.isAuthenticated = true;
            state.retryCount = null;
        }
    }
});

export const {
    removeAuth,
    saveAuth,
    clearAuth,
    incrementCount
} = authSlice.actions;

export default authSlice