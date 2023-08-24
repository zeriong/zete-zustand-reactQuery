import React, {Fragment, useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {Dialog, Transition } from '@headlessui/react';
import {FuncButton} from '../FuncButton';
import {apiBundle} from '../../../openapi/api';
import {PATTERNS} from '../../constants';
import {VisibilityOffIcon, VisibilityOnIcon} from '../Icons';
import {CreateAccountInput} from '../../../openapi/generated';
import {useAuthStore} from '../../../store/authStore';
import {useMutation} from '@tanstack/react-query';

export const SignUpModal = (props: { successControl: React.Dispatch<React.SetStateAction<boolean>> }) => {
    const { VALID_PASSWORD, INPUT_PASSWORD, EMAIL, INPUT_PHONE } = PATTERNS;

    const [searchParams, setSearchParams] = useSearchParams();
    const [isShow, setIsShow] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const authStore = useAuthStore();
    const createAccountMutation = useMutation(apiBundle.user.createAccount);

    const form = useForm<CreateAccountInput & { confirmPassword?: string }>({ mode: 'onChange' });

    const closeModal = () => {
        form.reset();
        searchParams.delete('modal');
        setSearchParams(searchParams);
    };

    const signupSubmit = form.handleSubmit(() => {
        const { confirmPassword, ...input } = form.getValues();

        createAccountMutation.mutate(input, {
            onSuccess: (data) => {
                if (!data.success) setErrorMessage(data.error || '잘못된 접근으로 에러가 발생했습니다.');
                closeModal();
                props.successControl(true);
            },
            onError: (error) => setErrorMessage('잘못된 접근으로 에러가 발생했습니다.'),
        });
    });

    useEffect(() => {
        if (searchParams.get('modal') === 'sign-up') return setIsShow(true);
        setIsShow(false);
    },[searchParams]);

    return (
        <>
            <Transition appear show={ isShow } as={ Fragment }>
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
                        <div className='fixed inset-0 bg-black bg-opacity-40' />
                    </Transition.Child>
                    <div className='fixed inset-0'>
                        <div className='flex min-h-full items-center justify-center p-[16px]'>
                            <Transition.Child
                                as={ Fragment }
                                enter='ease-out duration-300'
                                enterFrom='opacity-0 scale-95'
                                enterTo='opacity-100 scale-100'
                                leave='ease-in duration-200'
                                leaveFrom='opacity-100 scale-100'
                                leaveTo='opacity-0 scale-95'
                            >
                                <Dialog.Panel className='w-full max-w-sm overflow-hidden rounded-[8px] bg-white p-[24px] md:p-[32px] text-left shadow-xl'>
                                    <div className='flex justify-between items-end mb-[30px]'>
                                        <h1 className='text-[26px] font-bold'>
                                            회원가입
                                        </h1>
                                        <p className='text-red-500 py-[4px] px-[8px] font-bold text-[14px] md:text-[16px]'>
                                            { errorMessage }
                                        </p>
                                    </div>
                                    <form
                                        className='flex flex-col mx-auto gap-y-[20px] justify-center text-[15px] md:text-[18px]'
                                        onSubmit={ signupSubmit }
                                    >
                                        <div>
                                            <input
                                                {...form.register('name', {
                                                    required: true,
                                                    minLength: 2, maxLength: 32,
                                                })}
                                                tabIndex={ 1 }
                                                placeholder='이름을 입력해주세요.'
                                                className='border border-gray-400 rounded px-[8px] py-[4px] w-full'
                                            />
                                            <p className='mt-[4px] text-red-500 text-[11px] font-normal h-[12px]'>
                                                { form.formState.errors.name && '성함을 입력해 주시기 바랍니다.' }
                                            </p>
                                        </div>
                                        <div>
                                            <input
                                                {...form.register('email', {
                                                    required: true,
                                                    minLength: 6, maxLength: 64,
                                                    pattern: EMAIL,
                                                })}
                                                tabIndex={ 2 }
                                                placeholder='이메일을 입력해주세요.'
                                                className='border border-gray-400 rounded px-[8px] py-[4px] w-full'
                                            />
                                            <p className='mt-[4px] text-red-500 text-[11px] font-normal h-[12px]'>
                                                { form.formState.errors.email && '이메일을 입력해주시기 바랍니다.' }
                                            </p>
                                        </div>
                                        <div>
                                            <div className='relative'>
                                                <input
                                                    {...form.register('password', {
                                                        required: true,
                                                        minLength: 8, maxLength: 64,
                                                        pattern: VALID_PASSWORD,
                                                        onChange: (event) => {
                                                            // mask
                                                            const value = event.target.value;
                                                            event.target.value = value.replace(INPUT_PASSWORD, '');
                                                        },
                                                    })}
                                                    type={ showPassword ? 'text' : 'password' }
                                                    tabIndex={ 3 }
                                                    placeholder='비밀번호를 입력해주세요.'
                                                    className='border border-gray-400 rounded pl-[8px] pr-[30px] py-[4px] w-full'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={ () => setShowPassword(!showPassword) }
                                                    className='absolute right-0 text-[12px] h-fit text-gray-100 px-[8px] top-1/2 -translate-y-1/2'
                                                >
                                                    { showPassword ? <VisibilityOnIcon/> : <VisibilityOffIcon/>}
                                                </button>
                                            </div>
                                            <div className='flex justify-between'>
                                                <div className='mt-[4px] text-red-500 text-[11px] font-normal h-[12px]'>
                                                    {form.formState.errors.password &&
                                                        <div className='relative'>
                                                            비밀번호는 최소 8자입니다.
                                                            <h2 className='absolute top-[80%] text-[9px] whitespace-nowrap'>
                                                                숫자, 영문, 특수문자
                                                                <span className='px-[2px] mr-[2px] font-bold'>
                                                                    @$!%*#?&
                                                                </span>
                                                                를 포함해야 합니다.
                                                            </h2>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className='relative'>
                                                <input
                                                    {...form.register('confirmPassword', {
                                                        required: true,
                                                        minLength: 8, maxLength: 64,
                                                        pattern: VALID_PASSWORD,
                                                        validate: (value, data) => value === data.password,
                                                        onChange: (event) => {
                                                            // mask
                                                            const value = event.target.value;
                                                            event.target.value = value.replace(INPUT_PASSWORD, '');
                                                        },
                                                    })}
                                                    type={ showConfirmPassword ? 'text' : 'password' }
                                                    tabIndex={ 4 }
                                                    placeholder='비밀번호를 다시 한번 입력해주세요.'
                                                    className='border border-gray-400 rounded pl-[8px] pr-[30px] py-[4px] w-full'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={ () => setShowConfirmPassword(!showConfirmPassword) }
                                                    className='absolute right-0 text-[12px] h-fit text-gray-100 px-[8px] top-1/2 -translate-y-1/2'
                                                >
                                                    { showConfirmPassword ? <VisibilityOnIcon/> : <VisibilityOffIcon/> }
                                                </button>
                                            </div>
                                            <p className='mt-[4px] text-red-500 text-[12px] font-normal h-[12px]'>
                                                { form.formState.errors.confirmPassword && '비밀번호가 동일하지 않습니다.' }
                                            </p>
                                        </div>
                                        <div>
                                            <input
                                                {...form.register('mobile', {
                                                    required: true,
                                                    minLength: 13, maxLength: 14,
                                                    onChange: (event) => {
                                                        const value = event.target.value.substring(0, 13).replace(/[^0-9]/g, '')
                                                            .replace(INPUT_PHONE, '$1-$2-$3').replace(/(-{1,2})$/g, '');
                                                        event.target.value = value;
                                                    },
                                                })}
                                                tabIndex={ 5 }
                                                placeholder='휴대폰번호를 입력해주세요.'
                                                className='border border-gray-400 rounded px-[8px] py-[4px] w-full'
                                            />
                                            <p className='mt-[4px] text-red-500 text-[12px] font-normal h-[12px]'>
                                                { form.formState.errors.mobile && '휴대전화번호를 입력해주세요.' }
                                            </p>
                                        </div>
                                        <FuncButton
                                            options={{
                                                text: '회원가입',
                                                disabled: !form.formState.isValid,
                                                loading: authStore.loading,
                                            }}
                                            type='submit'
                                            className='w-full py-[6px] bg-primary text-white text-center cursor-pointer text-[22px] rounded-[16px] mt-[10px]'
                                        />
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}
