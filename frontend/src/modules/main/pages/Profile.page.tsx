import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Link} from 'react-router-dom';
import {resetMemosReducer} from '../../../store/memo/memo.slice';

export const ProfilePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userState = useSelector((state: RootState) => state.user);

    // 프로필 페이지로 이동시 list reset
    useEffect(() => {
        dispatch(resetMemosReducer());
    },[]);

    return !userState.loading &&
        <section
            className='relative gap-[26px] flex flex-col items-center justify-between md:justify-normal top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 p-[26px] text-start md:rounded-[12px]
                w-full md:w-fit bg-white h-full md:h-fit md:border md:border-gray-200 md:shadow-lg'
        >
            <div className='flex flex-col items-center gap-[26px]'>
                <h1 className='text-[30px] font-extrabold border-b-2 border-gray-400 px-[16px] md:px-[20px]'>
                    회원정보
                </h1>
                <p className='w-full text-[22px] md:text-[24px] font-bold border-b-2'>
                    { `이름: ${ userState.data.name }` }
                </p>
                <p className='w-full text-[22px] md:text-[24px] font-bold border-b-2'>
                    { `이메일: ${ userState.data.email }` }
                </p>
                <p className='w-full text-[22px] md:text-[24px] font-bold border-b-2'>
                    { `휴대전화번호: ${ userState.data.mobile }` }
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