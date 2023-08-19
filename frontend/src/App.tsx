import React, {useEffect} from 'react';
import {Router} from './router/Router';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from './store';
import {ToastAlert} from './common/components/ToastAlert';
import {getProfile} from './store/user/user.actions';
import {useAuthStore} from './store/authStore';

function App() {
    const authStore = useAuthStore();
    const userState = useSelector((state: RootState) => (state.user));
    const dispatch = useDispatch<AppDispatch>();

    useEffect(()=> {
        // 계정정보를 불러오는 것으로 로그인 검증
        (async () => dispatch(await getProfile()))()
    },[dispatch]);

    return (
        <>
            { (!authStore.loading || !userState.loading) && <Router/> }
            <ToastAlert/>
        </>
    )
}

export default App;
