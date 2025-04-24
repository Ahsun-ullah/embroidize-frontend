import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { blogsSlice } from './admin/blogs/blogsSlice';
import { categoryAndSubcategorySlice } from './admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import { protectedProductSlice } from './admin/protectedProducts/protectedProductSlice';
import { userSlice } from './admin/users/userSlice';
import { productCommonSlice } from './common/product/productCommonSlice';
import { userInfoSlice } from './common/user/userInfoSlice';
import { authSlice } from './public/auth/authSlice';
import { productSlice } from './public/products/productSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [categoryAndSubcategorySlice.reducerPath]:
        categoryAndSubcategorySlice.reducer,
      [authSlice.reducerPath]: authSlice.reducer,
      [userInfoSlice.reducerPath]: userInfoSlice.reducer,
      [userSlice.reducerPath]: userSlice.reducer,
      [productSlice.reducerPath]: productSlice.reducer,
      [protectedProductSlice.reducerPath]: protectedProductSlice.reducer,
      [productCommonSlice.reducerPath]: productCommonSlice.reducer,
      [blogsSlice.reducerPath]: blogsSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(categoryAndSubcategorySlice.middleware)
        .concat(userInfoSlice.middleware)
        .concat(userSlice.middleware)
        .concat(productSlice.middleware)
        .concat(protectedProductSlice.middleware)
        .concat(productCommonSlice.middleware)
        .concat(blogsSlice.middleware)
        .concat(authSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

const store = makeStore();
setupListeners(store.dispatch);

export { store };
