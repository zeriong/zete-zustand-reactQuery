import {Popover, Transition} from '@headlessui/react';
import React, {Fragment, useState} from 'react';
import {DeleteIcon, EditIcon, ThreeDotMenuIcon} from '../../../../common/components/Icons';
import {ConfirmButton} from '../../../../common/components/ConfirmButton';
import {loadMemos} from '../../../../libs/memo.lib';
import {useMutation, useQuery} from '@tanstack/react-query';
import {GetCategoriesOutput} from '../../../../openapi/generated';
import {useMemoStore} from '../../../../store/memoStore';
import {apiBundle} from '../../../../openapi/api';
import {useToastsStore} from '../../../../common/components/Toasts';

export const SavedMemoMenuPopover = ({ memoId }: { memoId: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getCategoriesQuery = useQuery<GetCategoriesOutput>(['memo/getCategories'], { enabled: false });
    const deleteMemoMutation = useMutation(apiBundle.memo.deleteMemo);

    const memoStore = useMemoStore();
    const toastsStore = useToastsStore();

    const deleteMemo = async () => {
        await deleteMemoMutation.mutateAsync({ id: memoId }, {
            onSuccess: (data) => {
                if (data.success) memoStore.deleteMemo(memoId);
                else toastsStore.addToast('삭제된 메모입니다.');
            },
            onError: () => toastsStore.addToast('삭제된 메모입니다.'),
        })
        getCategoriesQuery.refetch();
        loadMemos(true);
    }

    // 최종 승인 모달 오픈
    const openConfirmModal = (event) => {
        event.stopPropagation();
        setIsOpen(true);
    }

    return (
        <>
            <Popover className='relative h-fit'>
                {({ open }) => {
                    return(
                        <>
                            <Popover.Button className={`${ open && 'bg-black/10' } hover:bg-black/10 p-[1px] rounded-full w-[26px] h-[26px]`}>
                                <ThreeDotMenuIcon className='fill-dark/90 cursor-pointer'/>
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
                                <Popover.Panel static className='absolute z-10 mt-[12px] right-0 bottom-[130%] px-0 w-[150px] py-[6px] bg-white font-normal text-[14px] text-dark/90 shadow-lg border border-gray-500/10 rounded-[8px]'>
                                    <button
                                        type='button'
                                        className='flex items-center py-[5px] px-[12px] hover:bg-black/5 w-full'
                                    >
                                        <EditIcon className='fill-dark/80 mr-[6px] w-[18px] h-[18px]'/>
                                        <p>메모수정</p>
                                    </button>
                                    <button
                                        type='button'
                                        onClick={ openConfirmModal }
                                        className='flex items-center py-[5px] px-[12px] hover:bg-black/5 w-full'
                                    >
                                        <DeleteIcon className='fill-dark/80 mr-[6px] w-[18px] h-[18px]'/>
                                        <p>메모삭제</p>
                                    </button>
                                </Popover.Panel>
                            </Transition>
                        </>
                    )
                }}
            </Popover>
            <ConfirmButton
                options={{
                    setForeignSetOpen: setIsOpen,
                    foreignSetOpen: isOpen,
                    subject: `메모를 삭제하시겠습니까?`,
                    subtitle: '메모를 삭제하시면 다시 되돌릴 수 없습니다.',
                    confirmText: '삭제',
                    isNegative: true,
                    confirmCallback: deleteMemo,
                }}
                className='absolute z-50'
            />
        </>
    )
}