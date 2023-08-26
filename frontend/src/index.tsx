import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './common/style/global.css';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from './queryClient';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <QueryClientProvider client={ queryClient }>
        <App/>
    </QueryClientProvider>
);