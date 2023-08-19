import {configureStore} from '@reduxjs/toolkit';
import {authSlice} from './auth/auth.slice';
import {userSlice} from './user/user.slice';
import {alertSlice} from './alert/alert.slice';
import {memoSlice} from './memo/memo.slice';

export const store = configureStore({
    reducer: {
        memo: memoSlice.reducer,
        auth: authSlice.reducer,
        user: userSlice.reducer,
        alert: alertSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;