import React, {ReactNode, useEffect, useRef, useState} from 'react';
import CustomScroller from './customScroller';
import {useWindowResize} from '../../hooks/useWindowResize';

export const HorizontalScroll = (props: { isShowButton?: boolean, bgColor?: string, className?: string, children: ReactNode }) => {
    const scrollOuterRef = useRef<HTMLDivElement>(null);
    const scrollInnerRef = useRef<HTMLDivElement>(null);
    const scrollRefRef = useRef<CustomScroller>(null);

    const [scrollLeft, setScrollLeft] = useState(0);
    const [isShowLeftButton, setIsShowLeftButton] = useState(false);
    const [isShowRightButton, setIsShowRightButton] = useState(false);

    const windowResize = useWindowResize();

    const renderButton = () => {
        if (scrollLeft > 0) setIsShowLeftButton(true);
        else setIsShowLeftButton(false);

        if (scrollOuterRef.current?.offsetWidth && scrollInnerRef.current?.offsetWidth && scrollOuterRef.current?.offsetWidth < scrollInnerRef.current?.offsetWidth && scrollLeft !== 1) {
            setIsShowRightButton(true);
        } else {
            setIsShowRightButton(false);
        }
    }

    const wheelEvent = (event: WheelEvent) => {
        // 마우스 세로휠 가로 적용
        let left = scrollRefRef.current?.getScrollLeft() + event.deltaY;
        if (left < 0) left = 0;
        if (left > scrollRefRef.current?.getScrollWidth()) left = scrollRefRef.current?.getScrollWidth();
        scrollRefRef.current?.scrollLeft(left);
        event.preventDefault();
    }

    useEffect(() => {
        // 스크롤 등 환경에 따라 버튼 노출 컨트롤
        renderButton();
    }, [windowResize.width, scrollLeft]);

    useEffect(() => {
        const container = scrollOuterRef.current;
        container?.addEventListener('wheel', wheelEvent, { passive: false });
        return () => container?.removeEventListener('wheel', wheelEvent);
    }, []);

    return (
        <div className={`relative w-full ${ props.className }`} ref={ scrollOuterRef }>
            <CustomScroller ref={ scrollRefRef } autoHeight={ true } autoHide={ true } customTrackHorizontalStyle={{ height: 4 }} onScrollFrame={(event: any) => {
                setScrollLeft(event.left);
            }}>
                <div className='flex shrink'>
                    <div ref={ scrollInnerRef }>
                        { props.children }
                    </div>
                </div>
            </CustomScroller>
            {props.isShowButton && (
                <>
                    {isShowLeftButton && (
                        <div
                            onClick={() => {
                                let left = scrollRefRef.current?.getScrollLeft() - 100;
                                if (left < 0) left = 0;
                                scrollRefRef.current?.scrollLeft(left);
                            }}
                            style={{background: `linear-gradient(-90deg,hsla(0,0%,100%,0),${ props.bgColor? props.bgColor: '#fff' } 50%)`}}
                            className='absolute flex items-center justify-start top-0 left-0 w-[40px] h-full cursor-pointer'
                        >
                            <div className='w-[12px] h-[12px] border-t border-l border-black border-opacity-50 -rotate-45 ml-[2px]'/>
                        </div>
                    )}
                    {isShowRightButton && (
                        <div
                            onClick={() => {
                                let left = scrollRefRef.current?.getScrollLeft() + 100;
                                scrollRefRef.current?.scrollLeft(left);
                            }}
                            style={{background: `linear-gradient(90deg,hsla(0,0%,100%,0),${ props.bgColor? props.bgColor: '#fff' } 50%)`}}
                            className='absolute flex items-center justify-end top-0 right-0 w-[40px] h-full cursor-pointer'
                        >
                            <div className='w-[12px] h-[12px] border-t border-l border-black/50 rotate-[135deg] mr-[2px]'/>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}