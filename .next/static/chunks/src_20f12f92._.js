(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/Common/ScrollToTopBottom.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-down.js [app-client] (ecmascript) <export default as ChevronsDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevrons-up.js [app-client] (ecmascript) <export default as ChevronsUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const ScrollToTopBottom = ()=>{
    _s();
    const [isVisible, setIsVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const toggleVisibility = ()=>{
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };
    const scrollToTop = ()=>{
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    const scrollToBottom = ()=>{
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScrollToTopBottom.useEffect": ()=>{
            window.addEventListener('scroll', toggleVisibility);
            return ({
                "ScrollToTopBottom.useEffect": ()=>{
                    window.removeEventListener('scroll', toggleVisibility);
                }
            })["ScrollToTopBottom.useEffect"];
        }
    }["ScrollToTopBottom.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed bottom-4 right-2 z-50",
        children: isVisible && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col space-y-2 fixed bottom-28 right-2 z-50",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: scrollToTop,
                    className: "p-3 sm:p-2 rounded bg-gray-800 text-white   hover:bg-gray-900 focus:outline-none   focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsUp$3e$__["ChevronsUp"], {
                        className: "w-6 h-6 sm:w-5 sm:h-5"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Common/ScrollToTopBottom.jsx",
                        lineNumber: 48,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/Common/ScrollToTopBottom.jsx",
                    lineNumber: 42,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: scrollToBottom,
                    className: "p-3 sm:p-2 rounded bg-gray-800 text-white   hover:bg-gray-900 focus:outline-none   focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevrons$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronsDown$3e$__["ChevronsDown"], {
                        className: "w-6 h-6 sm:w-5 sm:h-5"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Common/ScrollToTopBottom.jsx",
                        lineNumber: 57,
                        columnNumber: 13
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/Common/ScrollToTopBottom.jsx",
                    lineNumber: 51,
                    columnNumber: 11
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/Common/ScrollToTopBottom.jsx",
            lineNumber: 41,
            columnNumber: 9
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/Common/ScrollToTopBottom.jsx",
        lineNumber: 39,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(ScrollToTopBottom, "J3yJOyGdBT4L7hs1p1XQYVGMdrY=");
_c = ScrollToTopBottom;
const __TURBOPACK__default__export__ = ScrollToTopBottom;
var _c;
__turbopack_context__.k.register(_c, "ScrollToTopBottom");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/providers/NProgressProvider.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "NProgressProvider": ()=>NProgressProvider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/nprogress/nprogress.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].configure({
    showSpinner: false
});
const NProgressProvider = (param)=>{
    let { children } = param;
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NProgressProvider.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].done();
        }
    }["NProgressProvider.useEffect"], [
        pathname,
        searchParams
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NProgressProvider.useEffect": ()=>{
            const handleAnchorClick = {
                "NProgressProvider.useEffect.handleAnchorClick": (event)=>{
                    const targetUrl = new URL(event.currentTarget.href);
                    const currentUrl = new URL(location.href);
                    if (targetUrl.origin === currentUrl.origin) {
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].start();
                    }
                }
            }["NProgressProvider.useEffect.handleAnchorClick"];
            const handleMutation = {
                "NProgressProvider.useEffect.handleMutation": ()=>{
                    const anchorElements = document.querySelectorAll('a');
                    anchorElements.forEach({
                        "NProgressProvider.useEffect.handleMutation": (anchor)=>anchor.addEventListener('click', handleAnchorClick)
                    }["NProgressProvider.useEffect.handleMutation"]);
                }
            }["NProgressProvider.useEffect.handleMutation"];
            const mutationObserver = new MutationObserver(handleMutation);
            mutationObserver.observe(document, {
                childList: true,
                subtree: true
            });
            window.history.pushState = new Proxy(window.history.pushState, {
                apply: {
                    "NProgressProvider.useEffect": (target, thisArg, argArray)=>{
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$nprogress$2f$nprogress$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].done();
                        return target.apply(thisArg, argArray);
                    }
                }["NProgressProvider.useEffect"]
            });
        }
    }["NProgressProvider.useEffect"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
};
_s(NProgressProvider, "jq/6JV7jSw8H7h1siyRMT4JsAUQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = NProgressProvider;
var _c;
__turbopack_context__.k.register(_c, "NProgressProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/admin/blogs/blogsSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "blogsSlice": ()=>blogsSlice,
    "useAddBlogMutation": ()=>useAddBlogMutation,
    "useAllBlogsQuery": ()=>useAllBlogsQuery,
    "useDeleteBlogMutation": ()=>useDeleteBlogMutation,
    "useSingleBlogQuery": ()=>useSingleBlogQuery,
    "useUpdateBlogMutation": ()=>useUpdateBlogMutation
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const blogsSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'blogsSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            addBlog: builder.mutation({
                query: (body)=>({
                        url: '/blog',
                        method: 'POST',
                        body
                    })
            }),
            updateBlog: builder.mutation({
                query: (body)=>({
                        url: "/blog/".concat(body.get('id')),
                        method: 'PUT',
                        body
                    })
            }),
            deleteBlog: builder.mutation({
                query: (id)=>({
                        url: "/blog/".concat(id),
                        method: 'DELETE'
                    })
            }),
            allBlogs: builder.query({
                query: function() {
                    let { page = 1, limit = 10, search = '' } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                    const params = new URLSearchParams();
                    params.append('page', String(page));
                    params.append('limit', String(limit));
                    if (search) {
                        params.append('search', search);
                    }
                    return {
                        url: "/public/admin/blog?".concat(params.toString()),
                        method: 'GET'
                    };
                }
            }),
            singleBlog: builder.query({
                query: (id)=>{
                    return {
                        url: "/public/blog/".concat(id),
                        method: 'GET'
                    };
                }
            })
        })
});
const { useAddBlogMutation, useUpdateBlogMutation, useDeleteBlogMutation, useAllBlogsQuery, useSingleBlogQuery } = blogsSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "categoryAndSubcategorySlice": ()=>categoryAndSubcategorySlice,
    "useAddProductCategoryMutation": ()=>useAddProductCategoryMutation,
    "useAddProductSubCategoryMutation": ()=>useAddProductSubCategoryMutation,
    "useGetPublicProductCategoriesQuery": ()=>useGetPublicProductCategoriesQuery,
    "useGetPublicProductSubCategoriesQuery": ()=>useGetPublicProductSubCategoriesQuery,
    "useGetSinglePublicProductCategoryQuery": ()=>useGetSinglePublicProductCategoryQuery,
    "useGetSinglePublicProductSubCategoryQuery": ()=>useGetSinglePublicProductSubCategoryQuery,
    "useUpdateProductCategoryMutation": ()=>useUpdateProductCategoryMutation,
    "useUpdateProductSubCategoryMutation": ()=>useUpdateProductSubCategoryMutation
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const categoryAndSubcategorySlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'categoryAndSubcategorySlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            // category add
            addProductCategory: builder.mutation({
                query: (body)=>({
                        url: '/product-category',
                        method: 'POST',
                        body
                    })
            }),
            // category update
            updateProductCategory: builder.mutation({
                query: (body)=>{
                    const id = body.get('id');
                    return {
                        url: "/product-category/".concat(id),
                        method: 'PUT',
                        body
                    };
                }
            }),
            // subcategory add
            addProductSubCategory: builder.mutation({
                query: (body)=>({
                        url: '/product-subcategory',
                        method: 'POST',
                        body
                    })
            }),
            // subcategory update
            updateProductSubCategory: builder.mutation({
                query: (body)=>{
                    const id = body.get('id');
                    return {
                        url: "/product-subcategory/".concat(id),
                        method: 'PUT',
                        body
                    };
                }
            }),
            getPublicProductCategories: builder.query({
                query: ()=>({
                        url: '/public/product-category',
                        method: 'GET'
                    }),
                keepUnusedDataFor: 60 * 60 * 24 * 30,
                refetchOnMountOrArgChange: false,
                refetchOnReconnect: false
            }),
            getSinglePublicProductCategory: builder.query({
                query: (id)=>({
                        url: "/public/product-category/".concat(id),
                        method: 'GET'
                    })
            }),
            getPublicProductSubCategories: builder.query({
                query: ()=>({
                        url: '/public/product-subcategory',
                        method: 'GET'
                    })
            }),
            getSinglePublicProductSubCategory: builder.query({
                query: (id)=>({
                        url: "/public/product-subcategory/".concat(id),
                        method: 'GET'
                    })
            })
        })
});
const { useAddProductCategoryMutation, useUpdateProductCategoryMutation, useAddProductSubCategoryMutation, useUpdateProductSubCategoryMutation, useGetPublicProductCategoriesQuery, useGetSinglePublicProductCategoryQuery, useGetPublicProductSubCategoriesQuery, useGetSinglePublicProductSubCategoryQuery } = categoryAndSubcategorySlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/admin/protectedProducts/protectedProductSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "protectedProductSlice": ()=>protectedProductSlice,
    "useAddProductMutation": ()=>useAddProductMutation,
    "useDeleteProductMutation": ()=>useDeleteProductMutation,
    "useUpdateProductMutation": ()=>useUpdateProductMutation
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const protectedProductSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'protectedProductSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            addProduct: builder.mutation({
                query: (body)=>({
                        url: '/product',
                        method: 'POST',
                        body
                    })
            }),
            updateProduct: builder.mutation({
                query: (body)=>({
                        url: "/product/".concat(body.get('id')),
                        method: 'PUT',
                        body
                    })
            }),
            deleteProduct: builder.mutation({
                query: (id)=>({
                        url: "/product/".concat(id),
                        method: 'DELETE'
                    })
            })
        })
});
const { useAddProductMutation, useUpdateProductMutation, useDeleteProductMutation } = protectedProductSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/admin/users/userSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useAllUsersQuery": ()=>useAllUsersQuery,
    "userSlice": ()=>userSlice
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const userSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'userSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            allUsers: builder.query({
                query: ()=>({
                        url: '/all-users',
                        method: 'GET'
                    })
            })
        })
});
const { useAllUsersQuery } = userSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/common/product/productCommonSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "productCommonSlice": ()=>productCommonSlice,
    "useLazyDownloadProductQuery": ()=>useLazyDownloadProductQuery
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const productCommonSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'productCommonSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            downloadProduct: builder.query({
                query: (body)=>{
                    const id = body.id;
                    const extension = body.extension;
                    return {
                        url: "/download/product/".concat(id, "/extension/").concat(extension),
                        method: 'GET',
                        responseHandler: (response)=>response.blob()
                    };
                },
                // Return a serializable value for Redux but keep the blob in meta
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                transformResponse: (blob, meta)=>{
                    return {
                        success: true
                    };
                },
                // Don't use the result for cache key generation
                serializeQueryArgs: (param)=>{
                    let { queryArgs } = param;
                    return JSON.stringify(queryArgs);
                },
                // Force refetch
                forceRefetch: ()=>true
            })
        })
});
const { useLazyDownloadProductQuery } = productCommonSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/common/user/userInfoSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useForgotPasswordMutation": ()=>useForgotPasswordMutation,
    "useResetPasswordMutation": ()=>useResetPasswordMutation,
    "useUpdatePasswordMutation": ()=>useUpdatePasswordMutation,
    "useUpdateUserInfoMutation": ()=>useUpdateUserInfoMutation,
    "useUserDownloadHistoryQuery": ()=>useUserDownloadHistoryQuery,
    "useUserInfoQuery": ()=>useUserInfoQuery,
    "userInfoSlice": ()=>userInfoSlice
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const userInfoSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'userInfoSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            userInfo: builder.query({
                query: ()=>({
                        url: '/userinfo',
                        method: 'GET'
                    })
            }),
            updateUserInfo: builder.mutation({
                query: (body)=>({
                        url: "/user/".concat(body.get('id')),
                        method: 'PUT',
                        body
                    })
            }),
            updatePassword: builder.mutation({
                query: (body)=>({
                        url: "/settings/password/",
                        method: 'PATCH',
                        body
                    })
            }),
            forgotPassword: builder.mutation({
                query: (body)=>({
                        url: '/public/forgot-password',
                        method: 'POST',
                        body
                    })
            }),
            resetPassword: builder.mutation({
                query: (body)=>({
                        url: '/public/reset-password',
                        method: 'POST',
                        body
                    })
            }),
            UserDownloadHistory: builder.query({
                query: (id)=>({
                        url: "/downloads/user/".concat(id),
                        method: 'GET'
                    })
            })
        })
});
const { useUserInfoQuery, useUpdateUserInfoMutation, useUserDownloadHistoryQuery, useUpdatePasswordMutation, useForgotPasswordMutation, useResetPasswordMutation } = userInfoSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/public/auth/authSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "authSlice": ()=>authSlice,
    "useAppleAuthMutation": ()=>useAppleAuthMutation,
    "useForgetPasswordMutation": ()=>useForgetPasswordMutation,
    "useGenerateOtpMutation": ()=>useGenerateOtpMutation,
    "useGoogleAuthMutation": ()=>useGoogleAuthMutation,
    "useLogInMutation": ()=>useLogInMutation,
    "useResetPasswordMutation": ()=>useResetPasswordMutation,
    "useUserRegisterMutation": ()=>useUserRegisterMutation,
    "useVerifyOtpMutation": ()=>useVerifyOtpMutation
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'authSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: "".concat(BASE_API_URL),
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            userRegister: builder.mutation({
                query: (body)=>({
                        url: '/public/register',
                        method: 'POST',
                        body
                    })
            }),
            generateOtp: builder.mutation({
                query: (body)=>({
                        url: '/public/otp',
                        method: 'POST',
                        body
                    })
            }),
            verifyOtp: builder.mutation({
                query: (body)=>({
                        url: '/public/otp/verify',
                        method: 'POST',
                        body
                    })
            }),
            logIn: builder.mutation({
                query: (body)=>{
                    return {
                        url: "/public/login",
                        method: 'POST',
                        body
                    };
                }
            }),
            googleAuth: builder.mutation({
                query: (body)=>({
                        url: '/public/auth/google',
                        method: 'POST',
                        body
                    })
            }),
            appleAuth: builder.mutation({
                query: (body)=>({
                        url: '/auth/apple',
                        method: 'POST',
                        body
                    })
            }),
            forgetPassword: builder.mutation({
                query: (body)=>{
                    return {
                        url: "/forgot-password",
                        method: 'POST',
                        body
                    };
                }
            }),
            resetPassword: builder.mutation({
                query: (body)=>{
                    return {
                        url: "/reset-password",
                        method: 'POST',
                        body
                    };
                }
            })
        })
});
const { useLogInMutation, useUserRegisterMutation, useForgetPasswordMutation, useResetPasswordMutation, useGenerateOtpMutation, useVerifyOtpMutation, useGoogleAuthMutation, useAppleAuthMutation } = authSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/public/products/productSlice.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "productSlice": ()=>productSlice,
    "useAllProductsQuery": ()=>useAllProductsQuery
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/react/rtk-query-react.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
const BASE_API_URL = ("TURBOPACK compile-time value", "https://api.embroidize.com/api/v1");
const productSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$react$2f$rtk$2d$query$2d$react$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createApi"])({
    reducerPath: 'productSlice',
    baseQuery: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchBaseQuery"])({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers)=>{
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('token');
            if (token) {
                headers.set('Authorization', "Bearer ".concat(token));
            }
            return headers;
        }
    }),
    endpoints: (builder)=>({
            allProducts: builder.query({
                query: function() {
                    let { search = '', page = 1, limit = 10 } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
                    const params = new URLSearchParams();
                    if (search) params.append('search', search);
                    params.append('page', String(page));
                    params.append('limit', String(limit));
                    return {
                        url: "/public/product?".concat(params.toString()),
                        method: 'GET'
                    };
                }
            })
        })
});
const { useAllProductsQuery } = productSlice;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/redux/store.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "makeStore": ()=>makeStore,
    "store": ()=>store
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/query/rtk-query.modern.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$blogs$2f$blogsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/admin/blogs/blogsSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$categoryAndSubcategory$2f$categoryAndSubcategorySlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$protectedProducts$2f$protectedProductSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/admin/protectedProducts/protectedProductSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$users$2f$userSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/admin/users/userSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$product$2f$productCommonSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/common/product/productCommonSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$user$2f$userInfoSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/common/user/userInfoSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$auth$2f$authSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/public/auth/authSlice.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$products$2f$productSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/public/products/productSlice.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
const makeStore = ()=>{
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
        reducer: {
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$categoryAndSubcategory$2f$categoryAndSubcategorySlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryAndSubcategorySlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$categoryAndSubcategory$2f$categoryAndSubcategorySlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryAndSubcategorySlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$auth$2f$authSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$auth$2f$authSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authSlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$user$2f$userInfoSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userInfoSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$user$2f$userInfoSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userInfoSlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$users$2f$userSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$users$2f$userSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userSlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$products$2f$productSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$products$2f$productSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productSlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$protectedProducts$2f$protectedProductSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["protectedProductSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$protectedProducts$2f$protectedProductSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["protectedProductSlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$product$2f$productCommonSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productCommonSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$product$2f$productCommonSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productCommonSlice"].reducer,
            [__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$blogs$2f$blogsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blogsSlice"].reducerPath]: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$blogs$2f$blogsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blogsSlice"].reducer
        },
        middleware: (getDefaultMiddleware)=>getDefaultMiddleware().concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$categoryAndSubcategory$2f$categoryAndSubcategorySlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["categoryAndSubcategorySlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$user$2f$userInfoSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userInfoSlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$users$2f$userSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["userSlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$products$2f$productSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productSlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$protectedProducts$2f$protectedProductSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["protectedProductSlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$common$2f$product$2f$productCommonSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["productCommonSlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$admin$2f$blogs$2f$blogsSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blogsSlice"].middleware).concat(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$public$2f$auth$2f$authSlice$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authSlice"].middleware),
        devTools: ("TURBOPACK compile-time value", "development") !== 'production'
    });
};
const store = makeStore();
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$query$2f$rtk$2d$query$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setupListeners"])(store.dispatch);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/providers/StoreProvider.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>StoreProvider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/redux/store.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function StoreProvider(param) {
    let { children } = param;
    _s();
    const storeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])();
    if (!storeRef.current) {
        storeRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$redux$2f$store$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["makeStore"])();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: storeRef.current,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/providers/StoreProvider.js",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_s(StoreProvider, "EtiU7pDwGhTDZwMnrKEqZbxjqXE=");
_c = StoreProvider;
var _c;
__turbopack_context__.k.register(_c, "StoreProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/providers/UiProvider.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>UiProvider
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$system$2f$dist$2f$chunk$2d$OKNU54ZL$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@heroui/system/dist/chunk-OKNU54ZL.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$toast$2f$dist$2f$chunk$2d$CRSRLBAU$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@heroui/toast/dist/chunk-CRSRLBAU.mjs [app-client] (ecmascript)");
'use client';
;
;
function UiProvider(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$system$2f$dist$2f$chunk$2d$OKNU54ZL$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HeroUIProvider"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$heroui$2f$toast$2f$dist$2f$chunk$2d$CRSRLBAU$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ToastProvider"], {
                placement: 'top-right',
                toastOffset: 'top-right'.includes('top') ? 40 : 0
            }, void 0, false, {
                fileName: "[project]/src/lib/providers/UiProvider.js",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/lib/providers/UiProvider.js",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = UiProvider;
var _c;
__turbopack_context__.k.register(_c, "UiProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/providers/ClientProviders.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>ClientProviders
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$StoreProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/StoreProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$UiProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/providers/UiProvider.js [app-client] (ecmascript)");
'use client';
;
;
;
function ClientProviders(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$StoreProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$providers$2f$UiProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/src/lib/providers/ClientProviders.jsx",
            lineNumber: 9,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/lib/providers/ClientProviders.jsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = ClientProviders;
var _c;
__turbopack_context__.k.register(_c, "ClientProviders");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_20f12f92._.js.map