import React from 'react';
import {Router} from './router/Router';
import {Toasts} from './common/components/Toasts';
import {useAuthStore} from './store/authStore';
import {useQuery} from '@tanstack/react-query';
import {apiBundle} from './openapi/api';

function App() {
    const authStore = useAuthStore();
    const getProfile = useQuery(['user/getProfile'], apiBundle.user.getProfile, {
        retry: false,
        staleTime: Infinity,
    });

    return (
        <>
            { (!authStore.loading || !getProfile.isLoading) && <Router/> }
            <Toasts/>
        </>
    )
}

export default App;
