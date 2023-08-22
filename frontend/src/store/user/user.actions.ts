import {createAsyncThunk} from '@reduxjs/toolkit';
import {api} from '../../openapi/api';

export const getProfile = createAsyncThunk(
    'user/getProfile',
    async (_, thunkAPI) => {
        try {
            const response = await api.user.getProfile();
            if (!response) return thunkAPI.rejectWithValue(null);

            return response.data;
        }
        catch (err) {
            thunkAPI.rejectWithValue(err);
        }
    }
);