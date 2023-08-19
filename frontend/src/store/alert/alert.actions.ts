import {store} from '../index';
import {alertSlice} from './alert.slice';

export const showAlert = (message: string) => {
    store.dispatch(alertSlice.actions.setAlertReducer({ message }));
}