import {configureStore} from '@reduxjs/toolkit';
import {memoSlice} from './memo/memo.slice';

export const store = configureStore({
    reducer: {
        memo: memoSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;