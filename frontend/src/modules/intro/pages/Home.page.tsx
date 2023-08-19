import React from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import memoImg from '../../../assets/scroll-g6570d2351_1920.png';

export const Home = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const authState = useSelector((state: RootState) => state.auth);
    const userState = useSelector((state: RootState) => state.user);

    const openSignInModal = () => {
        searchParams.set('modal','sign-in');
        setSearchParams(searchParams);
    }

    const openSignUpModal = () => {
        searchParams.set('modal','sign-up');
        setSearchParams(searchParams);
    }

    return !userState.loading &&
        <div className='flex h-full w-full overflow-hidden'>
            <div className='flex flex-col items-center md:items-end justify-center w-full md:w-1/2 font-bold text-[48px] text-gray-800 z-20 text-center md:pr-[5%]'>
                <div className='flex flex-col items-center w-[450px]'>
                    <h1 className='mt-[40px] text-[36px] md:text-[48px] text-gray-800 flex flex-col w-[376px]'>
                        깔끔한 기록을 위한
                        <span className='mt-[12px]'>
                            메모 서비스
                            <span className='ml-[16px] font-extrabold'>
                                Zete!
                            </span>
                        </span>
                    </h1>
                    {authState.isLoggedIn ? (
                        <div className='flex flex-col mt-[40px]'>
                            <h1 className='flex text-[26px] font-bold justify-center'>
                                { userState.data?.name && `어서오세요! ${ userState.data?.name }님` }
                            </h1>
                            <Link
                                to='memo'
                                className='text-[30px] font-bold flex py-[8px] px-[20px] items-center bg-deepPrimary
                                rounded-[16px] justify-center mt-[32px] cursor-pointer text-white'
                            >
                                Let's Zete!
                            </Link>
                        </div>
                    ) : (
                        <h1 className='text-[18px] md:text-[26px] font-medium mt-[30px] md:mt-[60px]'>
                            자주 잊는 계획이나 일정관리, 정산관리 등<br/>
                            다양한 메모를 좀 더 깔끔하게 정리하세요.<br/>
                            가입하고 무료로 시작하세요.
                        </h1>
                    )}
                    {!authState.isLoggedIn &&
                        <div className='flex flex-row text-[16px] md:text-[22px] mt-[30px] md:mt-[60px]'>
                            <button
                                type='button'
                                onClick={ openSignInModal }
                                className='w-[150px] md:w-[180px] py-[8px] flex justify-center border border-gray-500 bg-white
                                    mb-[12px] cursor-pointer items-center mr-[12px] md:mr-[24px] rounded-[16px]'
                            >
                                로그인하기
                            </button>
                            <button
                                type='button'
                                onClick={ openSignUpModal }
                                className='w-[150px] md:w-[180px] py-[8px] flex justify-center mb-[12px] cursor-pointer
                                    items-center bg-deepPrimary rounded-[16px] text-white'
                            >
                                회원가입
                            </button>
                        </div>
                    }
                </div>
            </div>
            <figure className='flex items-center justify-center md:justify-start fixed md:static opacity-50 md:opacity-100 w-full md:w-1/2 z-10 h-full font-bold text-[48px] text-gray-800 md:pl-[5%]'>
                <img
                    className='relative bottom-[80px] md:bottom-0 flex w-[300px] md:w-full max-w-[560px] h-auto'
                    src={ memoImg }
                    alt={ '' }
                />
            </figure>
        </div>
}