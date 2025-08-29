import {
    configureStore
} from '@reduxjs/toolkit';
import storage
    from 'redux-persist/lib/storage';
import {
    authSlice, themeSlice
} from "./indexSlicer.ts"
import {
    persistReducer, persistStore
} from 'redux-persist';
import errorsSlice
    from './slicer/errorSlicer.ts';
import cartSlice from './slicer/cartSlicer.ts';

const persistConfig = {
    key: 'root',
    storage,
};

const themeSlicePersist =
    persistReducer(persistConfig, themeSlice.reducer);
const authSlicePersist =
    persistReducer(persistConfig, authSlice.reducer);

const Store = configureStore({
    reducer: {
        theme: themeSlicePersist,
        auth: authSlicePersist,
        error: errorsSlice.reducer,
        cart: cartSlice.reducer
    },
    
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

const persistorStore =
    persistStore(Store);
type RootState =
    ReturnType<typeof Store.getState>;
type AppDispatchRedux =
    typeof Store.dispatch;

export type {
    RootState,
    AppDispatchRedux
}

export {
    Store,
    persistorStore
};