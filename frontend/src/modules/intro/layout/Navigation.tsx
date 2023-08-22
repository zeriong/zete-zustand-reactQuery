import {Link, useSearchParams} from 'react-router-dom';
import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import {HamburgerMenuIcon, LogoutIcon, ModifyIcon} from '../../../common/components/Icons';
import {useLayoutStore} from '../../../store/layoutStore';
import {useAuthStore} from '../../../store/authStore';
import {logout} from '../../../libs/memo.lib';
import {useQuery} from '@tanstack/react-query';
import {User} from '../../../openapi/generated';

export const HomeNav = ()=> {
    const [searchParams, setSearchParams] = useSearchParams();

    const layoutStore = useLayoutStore();
    const authStore = useAuthStore();
    // const userState = useSelector((state: RootState) => state.user);
    const user = useQuery<User>(['user/getProfile'], { enabled: false });

    const menuList: { name: string, to: string }[] = [
        { name: '서비스', to: '/service' },
        { name: '기능안내', to: '/guide' },
        { name: '고객사례', to: '/userExp' },
        { name: '요금안내', to: '/payNotice' },
        { name: '공지사항', to: '/notice' },
    ];

    const mobileHeaderButtonStyle = 'w-[100px] flex justify-center cursor-pointer rounded-[10px] p-[4px] ';

    const openSignInModal = () => {
        searchParams.set('modal','sign-in');
        setSearchParams(searchParams);
    }

    const openSignUpModal = () => {
        searchParams.set('modal','sign-up');
        setSearchParams(searchParams);
    }

    return !user.isLoading &&
        <nav className='flex justify-between h-[48px] md:h-auto pl-[12px] pr-[12px] items-center md:px-[40px] py-[12px] border-b border-gray-300 whitespace-nowrap fixed bg-white w-full z-30'>
            <div
                onClick={ () => layoutStore.setShowSideNav(false) }
                className={`transition-all ease-in-out fixed w-full h-full bg-black opacity-0 left-0 top-0 duration-300 z-30
                ${ layoutStore.isShowSideNav ? 'opacity-50 visible' : 'opacity-0 invisible' }`}
            />
            <Link to='/' className='font-bold text-[18px] md:text-[20px] mr-[48px]'>
                Zete
            </Link>

            {/** 모바일 환경 컴포넌트 */}
            <section
                className={`fixed md:static h-full md:h-auto w-[260px] md:w-full p-[28px] md:p-0 flex gap-[32px] justify-start bg-white bottom-0 flex-col ease-in-out duration-300 z-30
                ${ layoutStore.isShowSideNav ? 'right-0' : '-right-[260px]' }`}
            >
                <div className='block md:hidden font-bold border-b border-b-gray-300 pb-[20px] pl-[8px]'>
                    <div className='text-xl mb-[8px] text-gray-700'>
                        { authStore.isLoggedIn ? `${ user.data?.name }님` : '로그인해주세요.' }
                    </div>
                    {authStore.isLoggedIn ? (
                        <>
                            <div className='group flex items-center'>
                                <ModifyIcon width={22} height={22} className='ease-in-out duration-200 rotate-0 group-hover:rotate-[360deg]'/>
                                <Link to='memo' className='flex w-full py-[4px] pl-[8px] text-gray-600 hover:text-deepPrimary ease-in-out duration-150'>
                                    Let's Zete!
                                </Link>
                            </div>
                            <div className='group flex items-center'>
                                <LogoutIcon width={22} height={22}/>
                                <button
                                    type='button'
                                    className='flex w-full ease-in-out duration-150 pl-[8px] py-[4px] hover:text-red-500'
                                    onClick={() => {
                                        logout();
                                        layoutStore.setShowSideNav(false);
                                    }}
                                >
                                    로그아웃
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                type='button'
                                className={`flex w-full ease-in-out duration-150 pl-[8px] py-[4px] hover:text-primary`}
                                onClick={ openSignInModal }
                            >
                                로그인
                            </button>
                            <button
                                type='button'
                                onClick={ openSignUpModal }
                                className={`flex w-full ease-in-out duration-150 pl-[8px] py-[4px] hover:text-deepPrimary`}
                            >
                                회원가입
                            </button>
                        </>
                    )
                    }
                </div>
                <div className='flex flex-col md:flex-row gap-[4px] md:gap-[32px] text-[18px] font-bold justify-start w-full text-gray-700 '>
                    {menuList.map((menu, idx) => (
                        <Link
                            key={ idx }
                            to={ menu.to }
                            onClick={ () => layoutStore.setShowSideNav(false) }
                            className='justify-start rounded-[8px] py-[8px] pl-[8px] md:py-0 hover:bg-gray-200/50 md:hover:bg-transparent'
                        >
                            { menu.name }
                        </Link>
                    ))}
                </div>
            </section>

            {/** pc 환경 컴포넌트 */}
            {authStore.isLoggedIn ? (
                <section className='hidden md:flex flex-row items-center'>
                    <div className='text-[20px] font-bold text-gray-600 mr-[16px]'>
                        { user.data?.name && `${ user.data?.name }님` }
                    </div>
                    <Link
                        to='memo'
                        className='flex justify-center cursor-pointer rounded-[8px] py-[4px] px-[20px] bg-deepPrimary text-white mr-[12px]'
                    >
                        Let's Zete!
                    </Link>
                    <button
                        type='button'
                        onClick={() => {
                            logout();
                            layoutStore.setShowSideNav(false);
                        }}
                        className={ mobileHeaderButtonStyle + 'border border-gray-500' }
                    >
                        로그아웃
                    </button>
                </section>
            ) : (
                <section className='max-lg:invisible flex gap-[16px] items-center m-auto font-medium '>
                    <button
                        type='button'
                        onClick={ openSignInModal }
                        className={ mobileHeaderButtonStyle + 'border border-gray-500' }
                    >
                        로그인하기
                    </button>
                    <button
                        type='button'
                        onClick={ openSignUpModal }
                        className={ mobileHeaderButtonStyle + 'bg-deepPrimary text-white' }
                    >
                        회원가입
                    </button>
                </section>
            )}
            <button
                type='button'
                onClick={ () => layoutStore.toggleSideNav() }
                className='bg-white p-[6px] rounded-lg border border-gray-200 left-[12px] block md:hidden'
            >
                <HamburgerMenuIcon className='fill-deepPrimary/80'/>
            </button>
        </nav>
}