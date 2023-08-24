import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {User} from '../../../openapi/generated';

export const Service = () => {
    const getProfile = useQuery<User>(['user/getProfile'], { enabled: false });

    return !getProfile.isLoading &&
        <div className='flex justify-center items-center w-full h-full text-center'>
            <h1 className='text-[32px] font-bold'>
                서비스 페이지입니다.
            </h1>
        </div>
}