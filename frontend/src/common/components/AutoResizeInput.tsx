import React, {useRef, useImperativeHandle, InputHTMLAttributes} from 'react';

export const AutoResizeInput = React.forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    (props, ref) => {
        const inputRef = useRef<HTMLInputElement>(null);

        // 최종 타겟 ref를 inputRef로 지정
        useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

        const resizeInput = () => {
            if (inputRef.current) {
                inputRef.current.style.width = '50px';
                inputRef.current.style.width = inputRef.current.scrollWidth + 'px';
            }
        }

        return (
            <input
                { ...props }
                ref={ inputRef }
                onInput={() => {
                    // 직접적인 입력 감지
                    resizeInput();
                }}
            />
        )
    }
);