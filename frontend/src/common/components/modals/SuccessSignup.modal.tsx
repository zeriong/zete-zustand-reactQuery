import React, {Fragment} from 'react';
import {Dialog, Transition } from '@headlessui/react';
import {useSearchParams} from 'react-router-dom';

export const SuccessSignupModal = (props: { isShow: boolean, setIsShow: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const closeModal = () => {
        props.setIsShow(false);
        searchParams.set('modal', 'sign-in');
        setSearchParams(searchParams);
    }

    return (
        <Transition appear show={ props.isShow } as={ Fragment }>
            <Dialog as='div' className='relative z-50' onClose={ closeModal }>
                <Transition.Child
                    as={ Fragment }
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className='fixed inset-0 bg-black bg-opacity-40'/>
                </Transition.Child>
                <article className='fixed inset-0'>
                    <div className='flex h-full items-center justify-center p-[16px]'>
                        <Transition.Child
                            as={ Fragment }
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'
                        >
                            <Dialog.Panel className='w-full max-w-sm transform overflow-hidden rounded-[8px] bg-white p-[24px] md:p-[32px] text-left shadow-xl'>
                                <h1 className='text-[22px] md:text-[24px] mb-[20px]'>
                                    회원가입 성공!
                                </h1>
                                <h2 className='mb-[24px] text-[15px] md:text-[16px]'>
                                    Zete의 메모서비스를 무료로 이용해보세요.
                                </h2>
                                <button
                                    type='button'
                                    onClick={ closeModal }
                                    className='w-[160px] flex justify-center cursor-pointer rounded-[8px] p-[4px] bg-primary text-white m-auto'
                                >
                                    확인
                                </button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </article>
            </Dialog>
        </Transition>
    )
}