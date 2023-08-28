import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {User} from '../../../openapi/generated';
import {useMemoStore} from '../../../store/memoStore';

export const ProfilePage = () => {
    const getProfileQuery = useQuery<User>(['user/getProfile'], { enabled: false });

    const memoStore = useMemoStore();

    // 프로필 페이지로 이동시 list reset
    useEffect(() => {
        memoStore.resetMemos();
    },[]);

    return !getProfileQuery.isLoading &&
        <section
            className='relative gap-[26px] flex flex-col items-center justify-between md:justify-normal p-[26px] text-start md:rounded-[12px] md:top-[calc(50%-46px)] md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2
                w-full md:w-fit bg-white h-[calc(100%-46px)] md:h-fit md:border md:border-gray-200 md:shadow-lg'
        >
            <div className='flex flex-col items-center gap-[26px]'>
                <h1 className='text-[30px] font-extrabold border-b-2 border-gray-400 px-[16px] md:px-[20px]'>
                    회원정보
                </h1>
                <p className='w-full text-[22px] md:text-[24px] font-bold border-b-2'>
                    { `이름: ${ getProfileQuery.data.name }` }
                </p>
                <p className='w-full text-[22px] md:text-[24px] font-bold border-b-2'>
                    { `이메일: ${ getProfileQuery.data.email }` }
                </p>
                <p className='w-full text-[22px] md:text-[24px] font-bold border-b-2'>
                    { `휴대전화번호: ${ getProfileQuery.data.mobile }` }
                </p>
            </div>
            <Link
                to={ 'edit' }
                className='w-[180px] py-[8px] text-[22px] bg-deepPrimary rounded-[16px] text-center text-white'
            >
                회원정보 수정
            </Link>
        </section>
}