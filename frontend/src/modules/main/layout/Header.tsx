import React from 'react';
import {UserProfileMenuPopover} from '../components/popovers/UserProfileMenu.popover';
import {Link} from 'react-router-dom';
import {SearchMemo} from '../components/SearchMemo';
import {HamburgerMenuIcon} from '../../../common/components/Icons';
import {useLayoutStore} from '../../../store/layoutStore';

export const Header = () => {
    const layoutStore = useLayoutStore();

    return (
        <header className='flex fixed h-[46px] items-center justify-between w-full z-30 transition-all ease-in-out duration-300 bg-white border-b border-gray-300/80 py-[10px] px-[16px] side-menu-md:px-[10px]'>
            <div className='flex items-center'>
                <button
                    type='button'
                    onClick={ () => layoutStore.toggleSideNav() }
                    className='ease-in-out duration-300 block side-menu-md:hidden mr-[14px] h-full'
                >
                    <HamburgerMenuIcon height={20}/>
                </button>
                {/*브랜드마크*/}
                <div className='w-[26px] h-[26px] bg-primary rounded mr-[10px]'/>
                <Link
                    to='/memo'
                    className='flex relative justify-start items-center text-[17px] font-medium transition-all duration-300 h-full'
                >
                    ZETE
                </Link>
            </div>
            <div className='hidden md:block'>
                <SearchMemo/>
            </div>
            <div className='relative flex justify-end z-50 w-fit h-fit'>
                <UserProfileMenuPopover/>
            </div>
        </header>
    )
}