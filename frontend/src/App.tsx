import React from 'react';
import {Router} from './router/Router';
import {Toasts} from './common/components/Toasts';
import {useAuthStore} from './store/authStore';
import {useQuery} from '@tanstack/react-query';
import {apiBundle} from './openapi/api';

function App() {
    const authStore = useAuthStore();
    const getProfileQuery = useQuery(['user/getProfile'], apiBundle.user.getProfile, {
        retry: false,
        staleTime: Infinity,
    });

    return (
        <>
            { (!authStore.loading || !getProfileQuery.isLoading) && <Router/> }
            <Toasts/>
        </>
    )
}

export default App;
