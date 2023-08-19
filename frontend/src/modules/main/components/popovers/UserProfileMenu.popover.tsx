import React from 'react';
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import {Link} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../store';
import {LogoutIcon, ProfileIcon, UserIcon} from '../../../../common/components/Icons';
import {logoutAction} from '../../../../store/auth/auth.actions';

interface IMenuList {
    name: string;
    icon: JSX.Element;
    path: string;
    function?: any;
}

export const UserProfileMenuPopover = () => {
    const userState = useSelector((state: RootState) => state.user);

    const menuList: IMenuList[] = [
        {
            name: '나의 회원정보',
            icon: <ProfileIcon/>,
            path: 'profile',
        },
        {
            name: '로그아웃',
            icon: <LogoutIcon/>,
            path: '/',
            function: async () => await logoutAction(),
        },
    ];

    const listOnClick = (item, close) => {
        if (item.function) item.function();
        close();
    }

    return (
        <Popover className='relative z-50 w-[28px] h-[28px]'>
            {({ open, close }) => (
                <>
                    <Popover.Button>
                        <UserIcon className='absolute right-0 top-0'/>
                    </Popover.Button>
                    <Transition
                        as={ Fragment }
                        enter='transition ease-out duration-200'
                        enterFrom='opacity-0 translate-y-1'
                        enterTo='opacity-100 translate-y-0'
                        leave='transition ease-in duration-150'
                        leaveFrom='opacity-100 translate-y-0'
                        leaveTo='opacity-0 translate-y-1'
                    >
                        <Popover.Panel className='absolute mt-[12px] w-[160px] md:w-[180px] bg-white right-0 p-[12px] shadow-lg rounded-[8px] overflow-hidden border border-black/10'>
                            <h1 className='text-[18px] font-medium text-dark p-[4px] mb-[4px] cursor-default'>
                                { userState.data?.name }
                            </h1>
                            {menuList.map((item) => (
                                <Link
                                    key={ item.name }
                                    to={ item.path }
                                    onClick={ () => listOnClick(item, close) }
                                    className='flex items-center rounded h-[48px] transition duration-150 ease-in-out whitespace-nowrap hover:bg-gray-100/70'
                                >
                                    <div className='flex items-center justify-center h-[32px] md:h-[48px] w-[36px] text-white'>
                                        { item.icon }
                                    </div>
                                    <p className='ml-[8px] text-[14px] font-medium text-gray-900'>
                                        { item.name }
                                    </p>
                                </Link>
                            ))}
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    )
}