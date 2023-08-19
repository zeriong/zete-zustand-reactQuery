import {Navigate, useLocation} from 'react-router-dom';
import React from 'react';
import {useAuthStore} from '../store/authStore';

export const PrivateElement = (props: { children? : React.ReactElement }) : React.ReactElement => {
    const authStore = useAuthStore();

    let location = useLocation();

    // 로그인중 = 다음페이지, 로그인상태가 아니라면 홈("/")으로
    if (authStore.isLoggedIn) return props.children;

    return <Navigate to={'/'} state={{ from: location }}/>
};