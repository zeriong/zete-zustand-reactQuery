import {Navigate, useLocation} from 'react-router-dom';
import {RootState} from '../store';
import React from 'react';
import {useSelector} from 'react-redux';

export const PrivateElement = (props: { children? : React.ReactElement }) : React.ReactElement => {
    const authState = useSelector((state: RootState) => state.auth);

    let location = useLocation();

    // 로그인중 = 다음페이지, 로그인상태가 아니라면 홈("/")으로
    if (authState.isLoggedIn) return props.children;

    return <Navigate to={'/'} state={{ from: location }}/>
};