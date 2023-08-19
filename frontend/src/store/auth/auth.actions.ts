import {Api} from '../../openapi/api';
import {store} from '../index';
import {userSlice} from '../user/user.slice';
import {memoSlice} from '../memo/memo.slice';
import {authSlice} from './auth.slice';

export const logoutAction = async () => {
    try {
        await Api.auth.logout();
    } catch (e) {
        console.log(e)
    }
    store.dispatch(authSlice.actions.setLogoutReducer());
    store.dispatch(memoSlice.actions.resetMemosReducer());
    store.dispatch(userSlice.actions.setUserReducer(undefined));
}