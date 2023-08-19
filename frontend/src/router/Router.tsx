import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {Home} from '../modules/intro/pages/Home.page';
import {MemoLayout} from '../modules/main/layout/Layout';
import {EditProfilePage} from '../modules/main/pages/EditProfile.page';
import {PrivateElement} from './PrivateElement';
import {ProfilePage} from '../modules/main/pages/Profile.page';
import {MemoPage} from '../modules/main/pages/Memo.page';
import {HomeLayout} from '../modules/intro/layout/Layout';
import {Service} from '../modules/intro/pages/Service.page';
import {Guide} from '../modules/intro/pages/Guide.page';
import {UserExp} from '../modules/intro/pages/UserExperience.page';
import {PayNotice} from '../modules/intro/pages/PaymentNotice.page';
import {Notice} from '../modules/intro/pages/Notice.page';
import {UserProfileMenuPopover} from '../modules/main/components/popovers/UserProfileMenu.popover';

export const Router = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={ <HomeLayout/> }>
                    <Route index element={ <Home/> }/>
                    <Route path='service' element={ <Service/> }/>
                    <Route path='guide' element={ <Guide/> }/>
                    <Route path='userExp' element={ <UserExp/> }/>
                    <Route path='payNotice' element={ <PayNotice/> }/>
                    <Route path='notice' element={ <Notice/> }/>
                    <Route path='e' element={ <UserProfileMenuPopover/> }/>
                </Route>

                <Route path='/memo/*' element={ <PrivateElement><MemoLayout/></PrivateElement> }>
                    <Route index element={ <MemoPage/> }/>
                    <Route path='profile' element={ <ProfilePage/> }/>
                    <Route path='profile/edit' element={ <EditProfilePage/> }/>
                </Route>
            </Routes>
        </BrowserRouter>
    );
};