import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { categoryAndSubcategorySlice } from './admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { userInfoSlice } from './common/user/userInfoSlice';
import { authSlice } from './public/auth/authSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [categoryAndSubcategorySlice.reducerPath]:
        categoryAndSubcategorySlice.reducer,
      [authSlice.reducerPath]: authSlice.reducer,
      [userInfoSlice.reducerPath]: userInfoSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(categoryAndSubcategorySlice.middleware)
        .concat(userInfoSlice.middleware)
        .concat(authSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

const store = makeStore();
setupListeners(store.dispatch);

export { store };
