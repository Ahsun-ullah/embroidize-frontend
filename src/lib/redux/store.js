import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { categoryAndSubcategorySlice } from './admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { authSlice } from './public/auth/authSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [categoryAndSubcategorySlice.reducerPath]:
        categoryAndSubcategorySlice.reducer,
      [authSlice.reducerPath]: authSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(categoryAndSubcategorySlice.middleware)
        .concat(authSlice.middleware)
        .concat([]),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

const store = makeStore();
setupListeners(store.dispatch);
