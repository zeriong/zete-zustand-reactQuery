import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    options: {
        disabled: boolean;
        text: string;
        loading?: boolean;
    }
}

export const FuncButton = (props: ButtonProps) => {
    const buttonPropsOptions = Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'options'));

    return (
        <button
            { ...buttonPropsOptions }
            style={
                (props.options.disabled || props.options.loading) ?
                    { pointerEvents: 'none', backgroundColor: '#ccc', color: '#808080' } : {}
            }
        >
            {props.options.loading ?
                <div className='flex justify-center'>
                    <svg className='animate-spin -ml-[4px] mr-[12px] h-[20px] w-[20px] text-white'
                         xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-40' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'/>
                        <path className='opacity-100' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'/>
                    </svg>
                </div>
                : props.options.text}
        </button>
    )
}