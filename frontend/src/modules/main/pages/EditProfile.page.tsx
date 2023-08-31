import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {FuncButton} from '../../../common/components/FuncButton';
import {useNavigate} from 'react-router-dom';
import {apiBundle} from '../../../openapi/api';
import {PATTERNS} from '../../../common/constants';
import {UpdateAccountInput, User} from '../../../openapi/generated';
import {useToastsStore} from '../../../common/components/Toasts';
import {VisibilityOffIcon, VisibilityOnIcon} from '../../../common/components/Icons';
import {useMutation, useQuery} from '@tanstack/react-query';

export const EditProfilePage = () => {
    const { VALID_PASSWORD, INPUT_PASSWORD, EMAIL, INPUT_PHONE } = PATTERNS;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [occurError, setOccurError] = useState('');
    const [isRender, setIsRender] = useState(false);

    const navigate = useNavigate();
    const getProfileQuery = useQuery<User>(['user/getProfile'], { enabled: false });
    const updateProfileMutation = useMutation(apiBundle.user.updateProfile);

    // 컴포넌트가 마운트 되었을 때 store에 저장된 유저데이터로 form에 셋팅한다.
    const form = useForm<UpdateAccountInput & { confirmPassword: string | null }>({
        mode: 'onChange',
        defaultValues: {
            name: getProfileQuery.data.name,
            email: getProfileQuery.data.email,
            mobile: getProfileQuery.data.mobile,
        },
    });

    const toastsStore = useToastsStore();

    // jsx 태그의 복잡도를 낮추기 위해 반복되는 스타일 속성을
    // 유형별로 나누어 변수에 저장하여 적용

    const subTitleStyle = 'font-bold md:text-[18px] text-[14px] text-[#5f5f5f]';
    const inputStyle = 'border border-gray-400 rounded px-[8px] py-[4px] md:w-[384px] w-full';
    const errorStyle = 'mt-[4px] text-red-500 text-[12px] font-normal h-[12px]';

    // 프로필 수정 submit 함수
    const updateProfileSubmit = form.handleSubmit(async () => {
        const { email, password, name, mobile } = form.getValues();
        const data = getProfileQuery.data;

        // 데모 사용자의 경우 회원정보수정 불가능
        if (data.email === 'demo@demo.com') {
            if (!password && email === data.email && name === data.name && mobile && data.mobile) {
                navigate(-1);
            } else {
                setOccurError('데모 계정은 수정불가');
                toastsStore.addToast('❌ 데모 계정은 수정이 불가능합니다.');
            }
            return;
        }

        // 프로필에 변경사항이 없다면 요청하지 않고 이전 페이지로 이동 (일반적으로 이전페이지는 프로필페이지)
        if (data.name === name && data.email === email && data.mobile === mobile && password.length === 0) return navigate(-1);

        updateProfileMutation.mutate({ email, name, mobile, password }, {
            onSuccess: async (data) => {
                if (data.success) {
                    await getProfileQuery.refetch();
                    toastsStore.addToast('✔ 회원정보 수정이 완료되었습니다!');
                    navigate(-1);
                } else {
                    setOccurError(data.error);
                    toastsStore.addToast('❌ 회원정보 수정에 실패했습니다.');
                }
            },
        });
    });

    // 밑에서 위로 올라오는 애니메이션을 위한 컴포넌트 마운트시 state 변경
    useEffect(() => {
        setIsRender(true);
    }, []);

    return  !getProfileQuery.isLoading &&
        <div className='w-full min-h-[640px] md:min-h-[700px] h-full relative flex justify-center items-center overflow-hidden'>
            <form
                onSubmit={ updateProfileSubmit }
                className={`flex flex-col justify-center relative bg-white text-start items-center shadow-2xl transition-all ease-in-out duration-500
                md:gap-[16px] md:p-[20px] md:rounded-[16px] md:border md:border-gray-300 md:w-auto md:h-auto h-full w-full gap-[14px] px-[16px]
                ${ isRender ? 'bottom-0' : '-bottom-full' }`}
            >
                <div className='relative font-extrabold text-[24px] md:text-[30px] w-full mb-[8px] md:mb-[20px] text-center md:text-start'>
                    <p>프로필 변경</p>
                    <p className='absolute text-[16px] md:text-[20px] text-red-500 font-bold translate-x-1/2 md:translate-x-0 right-1/2 md:right-[8px] md:bottom-0'>
                        { occurError }
                    </p>
                </div>
                <div className='md:w-auto w-full md:px-0'>
                    <p className={ subTitleStyle }>
                        이름
                    </p>
                    <input
                        {...form.register('name', {
                            required: true,
                            minLength: 2, maxLength: 30,
                        })}
                        tabIndex={ 1 }
                        placeholder='수정할 이름을 입력해주세요.'
                        className={ inputStyle }
                    />
                    <p className={ errorStyle }>
                        { form.formState.errors.name && '성함을 입력해 주시기 바랍니다.' }
                    </p>
                </div>
                <div className='md:w-auto w-full md:px-0'>
                    <h2 className={ subTitleStyle }>
                        이메일
                        <span className='md:text-[14px] text-[12px] text-orange-400/80'>
                            &nbsp;(현계정에 등록된 이메일 외 중복이메일은 등록불가)
                        </span>
                    </h2>
                    <input
                        {...form.register('email', {
                            required: true,
                            minLength: 6, maxLength: 64,
                            pattern: EMAIL,
                        })}
                        tabIndex={ 2 }
                        placeholder='변경할 이메일을 입력해주세요.'
                        className={ inputStyle }
                    />
                    <p className={ errorStyle }>
                        { form.formState.errors.email && '이메일을 입력해주시기 바랍니다.' }
                    </p>
                </div>
                <div className='md:w-auto w-full md:px-0'>
                    <p className={ subTitleStyle }>
                        휴대전화번호
                    </p>
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
                        type='text'
                        tabIndex={ 3 }
                        placeholder='휴대폰번호를 입력해주세요.'
                        className={ inputStyle }
                    />
                    <p className={ errorStyle }>
                        { form.formState.errors.mobile && '휴대전화번호를 입력해주세요.' }
                    </p>
                </div>
                <p className='text-center font-extrabold md:text-[18px] mt-[12px] text-[15px] text-gray-500'>
                    { '< 비밀변호 변경은 필수입력 사항이 아닙니다. >' }
                </p>
                <div className='w-full md:px-0'>
                    <p className={ subTitleStyle }>
                        비밀번호 변경
                    </p>
                    <div className='relative'>
                        <input
                            {...form.register('password', {
                                required: false,
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
                    <div className={ `${errorStyle} mb-[18px] w-full` }>
                        {form.formState.errors.password &&
                            <div className='relative'>
                                비밀번호는 최소 8자입니다.
                                <h3 className='absolute top-[80%] text-[9px] whitespace-nowrap'>
                                    숫자, 영문, 특수문자
                                    <span className='px-[2px] mr-[2px] overflow-hidden font-bold'>
                                            @$!%*#?&
                                        </span>
                                    를 포함해야 합니다.
                                </h3>
                            </div>
                        }
                    </div>
                    <p className={ subTitleStyle }>
                        비밀번호 변경 재확인
                    </p>
                    <div className='relative'>
                        <input
                            {...form.register('confirmPassword', {
                                required: false,
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
                    <p className={ errorStyle }>
                        { form.formState.errors.confirmPassword && '비밀번호가 동일하지 않습니다.' }
                    </p>
                </div>
                <FuncButton
                    options={{
                        text: '프로필 변경하기',
                        disabled: !form.formState.isValid,
                        loading: getProfileQuery.isLoading,
                    }}
                    type='submit'
                    className='mt-[32px] w-full py-[8px] flex justify-center mb-[12px] cursor-pointer text-[18px] md:text-[22px] items-center bg-primary rounded-[16px] text-white'
                />
            </form>
        </div>
}