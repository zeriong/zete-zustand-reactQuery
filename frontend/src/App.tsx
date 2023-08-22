import React, {useEffect} from 'react';
import {Router} from './router/Router';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from './store';
import {Toasts} from './common/components/Toasts';
import {getProfile} from './store/user/user.actions';
import {useAuthStore} from './store/authStore';
import {useQuery} from '@tanstack/react-query';
import {apiBundle} from './openapi/api';
import {setUserReducer} from './store/user/user.slice';

function App() {
    const authStore = useAuthStore();
    const user = useQuery(['user/getProfile'], apiBundle.user.getProfile, {
        retry: false,
        staleTime: 1000 * 60 * 10 // 10분
    });

    // const userState = useSelector((state: RootState) => state.user)
    //
    // // TODO: 리액트쿼리 적용 후 삭제
    // const dispatch = useDispatch<AppDispatch>();
    //
    // useEffect(()=> {
    //     // 계정정보를 불러오는 것으로 로그인 검증
    //     // (async () => dispatch(await getProfile()))()
    //
    //     // TODO: 임시 상태관리, 리액트쿼리 적용 후 삭제
    //     // if (user.data) dispatch(setUserReducer(user.data));
    // },[]);

    return (
        <>
            { (!authStore.loading || !user.isLoading) && <Router/> }
            <Toasts/>
        </>
    )
}

export default App;
