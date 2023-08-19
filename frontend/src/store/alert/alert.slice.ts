import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface IAlertObject {
    message?: string;
}

interface INotificationState {
    alerts: Array<IAlertObject>;
}

const initState: INotificationState = {
    alerts: [],
}

export const alertSlice = createSlice({
    name: 'alert',
    initialState: initState,
    reducers: {
        setAlertReducer: (state: INotificationState, { payload }: PayloadAction<IAlertObject>) => {
            state.alerts.push({message: payload.message});
        },
        deleteAlertReducer: (state:INotificationState) => {
            state.alerts.shift();
        },
    },
})

export const { deleteAlertReducer } = alertSlice.actions;