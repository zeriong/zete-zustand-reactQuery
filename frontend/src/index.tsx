import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './common/style/global.css';
import {Provider} from 'react-redux';
import {store} from './store';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const root = ReactDOM.createRoot(document.getElementById('root'));
export const queryClient = new QueryClient();

root.render(
    <QueryClientProvider client={ queryClient }>
        <Provider store={ store }>
            <App/>
        </Provider>
    </QueryClientProvider>
);