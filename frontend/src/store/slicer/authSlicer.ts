import {
    createSlice, type PayloadAction
} from "@reduxjs/toolkit";


interface Auth {
    username: string | null,
    isAuthenticated: boolean | null,
    retryCount: number | null;
    id: number | null;
}

interface PayloadSlice {
    username: string,
    id: number
}

const defaultAuth: Auth = {
    username: null,
    isAuthenticated: null,
    retryCount: null,
    id: null
}

const authSlice = createSlice({
    name: "auth",
    initialState: defaultAuth,
    reducers: {
        removeAuth: (state) => {
            state.username = null;
            state.isAuthenticated = false
            state.retryCount = null;
            state.id = null;
        },
        clearAuth: (state) => {
            state.isAuthenticated = null;
            state.retryCount = null;
            state.id = null;
        },
        incrementCount: (state) => {
            if (typeof state.retryCount === 'number') state.retryCount = state.retryCount + 1;
        },
        saveAuth: (state, action: PayloadAction<PayloadSlice>) => {
            state.username =
                action.payload.username;
            state.isAuthenticated = true;
            state.id = action.payload.id;
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

export type {
    PayloadSlice
};


export default authSlice