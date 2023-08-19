import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface IState {
    isLoggedIn: boolean;
    accessToken: string;
    loading: boolean | undefined;
}

const initState: IState = {
    isLoggedIn: false,
    accessToken: '',
    loading: true,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: initState,
    reducers: {
        setLoginReducer: (state: IState, { payload }: PayloadAction<string>) => {
            state.accessToken = payload;
            state.isLoggedIn = true;
            state.loading = false;
        },
        setLogoutReducer: (state: IState) => {
            state.accessToken = '';
            state.isLoggedIn = false;
            state.loading = false;
        },
    },
});

export const { setLoginReducer, setLogoutReducer } = authSlice.actions;