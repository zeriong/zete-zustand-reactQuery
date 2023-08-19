import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';

export const PayNotice = () => {
    const userState = useSelector((state: RootState) => state.user);

    return !userState.loading &&
        <div className='flex justify-center items-center w-full h-full text-center'>
            <h1 className='text-[32px] font-bold'>
                요금안내 페이지입니다.
            </h1>
        </div>
}