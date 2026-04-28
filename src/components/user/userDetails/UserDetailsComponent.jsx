'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import { useGetUserFavoritesQuery } from '@/lib/redux/common/favorites/favoritesSlice';
import {
  useUserDownloadHistoryQuery,
  useUserInfoQuery,
} from '@/lib/redux/common/user/userInfoSlice';
import { Tab, Tabs } from '@heroui/react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import ChangePasswordForm from './UserChangePasswordForm';
import UserProfile from './UserProfile';

const ITEMS_PER_PAGE = 5;

export default function UserDetailsComponent({ defaultTab = 'account' }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isPlanNavigating, setIsPlanNavigating] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: userInfo } = useUserInfoQuery();
  const userId = userInfo?._id;

  const { data: downloadHistory, isLoading: isDownloadLoading } =
    useUserDownloadHistoryQuery(userId, { skip: !userId });

  const { data: favoritesData, isLoading: isFavoritesLoading } =
    useGetUserFavoritesQuery(undefined, { skip: activeTab !== 'favourites' });

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType]);

  // ✅ Fixed: loadingId now uses downloadId (_id) not product._id
  const handleSingleZipFileDownload = async ({ id, extension, downloadId }) => {
    const token = Cookies.get('token');
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    try {
      setLoadingId(downloadId); // ✅ unique per row
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/redownload/product/${id}/extension/${extension}`,
        { method: 'GET', headers },
      );
      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `From_Embroidize_${extension}.zip`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      ErrorToast(
        'Download Failed',
        err?.message || 'Could not download file',
        3000,
      );
    } finally {
      setLoadingId(null);
    }
  };

  const allDownloads = downloadHistory?.data ?? [];

  const fileTypes = useMemo(() => {
    const types = [
      ...new Set(allDownloads.map((d) => d.fileType?.toLowerCase())),
    ];
    return types.sort();
  }, [allDownloads]);

  const filtered = useMemo(() => {
    return allDownloads.filter((d) => {
      const matchesSearch =
        search === '' ||
        d.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.fileType?.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        filterType === 'all' || d.fileType?.toLowerCase() === filterType;
      return matchesSearch && matchesType;
    });
  }, [allDownloads, search, filterType]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDownloadTab = useMemo(() => {
    if (isDownloadLoading) return <LoadingSpinner />;

    return (
      <div className='container mx-auto'>
        {/* Toolbar */}
        <div className='flex flex-col sm:flex-row gap-3 mb-5'>
          <div className='relative flex-1'>
            <i className='ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm' />
            <input
              type='text'
              placeholder='Search by design name or file type...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-gray-400'
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <i className='ri-close-line text-sm' />
              </button>
            )}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className='px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-600 cursor-pointer'
          >
            <option value='all'>All File Types</option>
            {fileTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Stats bar */}
        <div className='flex items-center justify-between mb-4'>
          <p className='text-xs text-gray-400'>
            Showing{' '}
            <span className='font-semibold text-gray-700'>
              {filtered.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
              –{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{' '}
            of{' '}
            <span className='font-semibold text-gray-700'>
              {filtered.length}
            </span>{' '}
            downloads
          </p>
          {(search || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterType('all');
              }}
              className='text-xs text-violet-600 hover:text-violet-700 font-medium underline underline-offset-2'
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className='text-center py-16 bg-white border border-gray-100 rounded-2xl'>
            <p className='text-4xl mb-3'>📭</p>
            <p className='text-gray-500 font-medium'>No downloads found</p>
            <p className='text-gray-400 text-sm mt-1'>
              {search || filterType !== 'all'
                ? 'Try adjusting your filters'
                : 'Your download history will appear here'}
            </p>
          </div>
        ) : (
          <>
            {/* Table header (desktop) */}
            <div className='hidden md:grid grid-cols-12 gap-4 px-4 py-2 mb-2'>
              <div className='col-span-1' />
              <div className='col-span-5 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                Design
              </div>
              <div className='col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                Format
              </div>
              <div className='col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                Date
              </div>
              <div className='col-span-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right'>
                Action
              </div>
            </div>

            {/* Rows */}
            <div className='space-y-2'>
              {paginated.map((design) => {
                const { _id, downloadedAt, fileType, product } = design;
                const imageUrl = product?.image?.url ?? '/fallback-image.png';

                // ✅ Fixed: check against _id (unique per row) not product._id
                const isDownloading = loadingId === _id;

                return (
                  <div
                    key={_id}
                    className='bg-white border border-gray-100 rounded-2xl px-4 py-4 hover:border-violet-200 hover:shadow-sm transition-all duration-200'
                  >
                    {/* Desktop */}
                    <div className='hidden md:grid grid-cols-12 gap-4 items-center'>
                      <Link
                        href={`/product/${product?.slug}`}
                        className='col-span-1'
                      >
                        <img
                          src={imageUrl}
                          alt={product?.name}
                          className='w-10 h-10 object-cover rounded-lg border border-gray-100'
                        />
                      </Link>

                      <div className='col-span-5'>
                        <Link
                          href={`/product/${product?.slug}`}
                          className='text-sm font-semibold text-gray-800 line-clamp-1'
                        >
                          {product?.name}
                        </Link>
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {formatTime(downloadedAt)}
                        </p>
                      </div>

                      <div className='col-span-2'>
                        <span className='inline-block bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider'>
                          {fileType}
                        </span>
                      </div>

                      <div className='col-span-2'>
                        <p className='text-sm text-gray-500'>
                          {formatDate(downloadedAt)}
                        </p>
                      </div>

                      <div className='col-span-2 flex justify-end'>
                        {isDownloading ? (
                          <div className='w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
                        ) : (
                          <button
                            onClick={() =>
                              handleSingleZipFileDownload({
                                extension: fileType,
                                id: product?._id,
                                downloadId: _id, // ✅ unique row ID
                              })
                            }
                            disabled={!!loadingId}
                            className='flex items-center gap-1.5 bg-gray-900 hover:bg-violet-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200'
                          >
                            <i className='ri-download-line text-sm' />
                            Download
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className='flex md:hidden gap-3 items-start'>
                      <img
                        src={imageUrl}
                        alt={product?.name}
                        className='w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-gray-800 line-clamp-2'>
                          {product?.name}
                        </p>
                        <div className='flex items-center gap-2 mt-1.5'>
                          <span className='bg-violet-50 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-md uppercase'>
                            {fileType}
                          </span>
                          <span className='text-xs text-gray-400'>
                            {formatDate(downloadedAt)}
                          </span>
                        </div>
                      </div>
                      <div className='flex-shrink-0'>
                        {isDownloading ? (
                          <div className='w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin' />
                        ) : (
                          <button
                            onClick={() =>
                              handleSingleZipFileDownload({
                                extension: fileType,
                                id: product?._id,
                                downloadId: _id, // ✅ unique row ID
                              })
                            }
                            disabled={!!loadingId}
                            className='w-9 h-9 flex items-center justify-center bg-gray-900 hover:bg-violet-600 disabled:bg-gray-200 text-white rounded-xl transition-all duration-200'
                          >
                            <i className='ri-download-line text-sm' />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-center gap-2 mt-6'>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className='w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150'
                >
                  <i className='ri-arrow-left-s-line text-lg' />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isActive = page === currentPage;
                    const show =
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1;
                    const showEllipsisBefore =
                      page === currentPage - 2 && currentPage > 3;
                    const showEllipsisAfter =
                      page === currentPage + 2 && currentPage < totalPages - 2;

                    if (showEllipsisBefore || showEllipsisAfter) {
                      return (
                        <span key={page} className='text-gray-300 text-sm px-1'>
                          •••
                        </span>
                      );
                    }
                    if (!show) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-violet-600 text-white border border-violet-600 shadow-sm shadow-violet-200'
                            : 'border border-gray-200 bg-white text-gray-600 hover:border-violet-400 hover:text-violet-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  },
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className='w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150'
                >
                  <i className='ri-arrow-right-s-line text-lg' />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }, [
    downloadHistory,
    loadingId,
    search,
    filterType,
    currentPage,
    filtered,
    paginated,
    totalPages,
  ]);

  return (
    <div className=' py-6 sm:py-8 md:py-10'>
      <div className='flex items-center justify-center'>
        <div className='w-full max-w-full overflow-x-auto flex items-center justify-center'>
          <Tabs
            aria-label='User Tabs'
            selectedKey={activeTab}
            onSelectionChange={(key) => {
              if (key === 'my-plan') {
                setIsPlanNavigating(true);
                router.push('/user/my-plan');
                return;
              }
              setActiveTab(key);
            }}
            color='secondary'
            variant='bordered'
            size='sm'
            placement='top'
            className='flex-nowrap min-w-max'
          >
            {/* Account */}
            <Tab
              key='account'
              title={
                <div
                  className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 ${
                    activeTab === 'account' ? 'text-white' : 'text-black'
                  }`}
                >
                  <i className='ri-account-circle-fill text-base sm:text-lg md:text-xl' />
                  <span className='text-[11px] sm:text-sm md:text-base whitespace-nowrap'>
                    <span className='sm:inline hidden'>Account</span>
                    <span className='sm:hidden'>Acc</span>
                  </span>
                </div>
              }
            />

            {/* Password */}
            <Tab
              key='password'
              title={
                <div
                  className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 ${
                    activeTab === 'password' ? 'text-white' : 'text-black'
                  }`}
                >
                  <i className='ri-lock-password-fill text-base sm:text-lg md:text-xl' />
                  <span className='text-[11px] sm:text-sm md:text-base whitespace-nowrap'>
                    <span className='hidden sm:inline'>Change Password</span>
                    <span className='sm:hidden'>Pass</span>
                  </span>
                </div>
              }
            />

            {/* Downloads */}
            <Tab
              key='downloads'
              title={
                <div
                  className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 ${
                    activeTab === 'downloads' ? 'text-white' : 'text-black'
                  }`}
                >
                  <i className='ri-download-fill text-base sm:text-lg md:text-xl' />
                  <span className='text-[11px] sm:text-sm md:text-base whitespace-nowrap'>
                    <span className='hidden sm:inline'>Downloads</span>
                    <span className='sm:hidden'>Down</span>
                  </span>
                </div>
              }
            />

            {/* Favourites */}
            <Tab
              key='favourites'
              title={
                <div
                  className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 ${
                    activeTab === 'favourites' ? 'text-white' : 'text-black'
                  }`}
                >
                  <i className='ri-heart-fill text-base sm:text-lg md:text-xl' />
                  <span className='text-[11px] sm:text-sm md:text-base whitespace-nowrap'>
                    <span className='hidden sm:inline'>My Favourites</span>
                    <span className='sm:hidden'>Favs</span>
                  </span>
                </div>
              }
            />

            {/* My Plan — navigates away on click */}
            <Tab
              key='my-plan'
              title={
                <div className='flex items-center gap-1 sm:gap-2 px-1 sm:px-2 text-black'>
                  {isPlanNavigating ? (
                    <span className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
                  ) : (
                    <i className='ri-vip-crown-fill text-base sm:text-lg md:text-xl' />
                  )}
                  <span className='text-[11px] sm:text-sm md:text-base whitespace-nowrap'>
                    {isPlanNavigating ? (
                      <span className='hidden sm:inline'>Loading...</span>
                    ) : (
                      <>
                        <span className='hidden sm:inline'>My Plan</span>
                        <span className='sm:hidden'>Plan</span>
                      </>
                    )}
                  </span>
                </div>
              }
            />
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className='w-full px-3 sm:px-6 mt-4 sm:mt-6'>
        {activeTab === 'account' && <UserProfile />}
        {activeTab === 'downloads' && renderDownloadTab}
        {activeTab === 'password' && <ChangePasswordForm />}
        {activeTab === 'favourites' && (
          <div>
            {isFavoritesLoading ? (
              <LoadingSpinner />
            ) : favoritesData?.data?.products?.length > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
                {favoritesData.data.products.map((product, index) => (
                  <ProductCard key={product._id} item={product} index={index} />
                ))}
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center py-20 text-center'>
                <div className='text-5xl mb-4'>🤍</div>
                <p className='text-gray-700 font-semibold text-lg'>No favourites yet</p>
                <p className='text-gray-400 text-sm mt-1'>
                  Tap the heart on any design to save it here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
