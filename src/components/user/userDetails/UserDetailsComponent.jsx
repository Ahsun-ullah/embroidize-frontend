'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import {
  useUserDownloadHistoryQuery,
  useUserInfoQuery,
} from '@/lib/redux/common/user/userInfoSlice';
import { Tab, Tabs } from '@heroui/react';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';
import ChangePasswordForm from './UserChangePasswordForm';
import UserProfile from './UserProfile';

export default function UserDetailsComponent({ defaultTab = 'account' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loadingId, setLoadingId] = useState(null);

  const { data: userInfo } = useUserInfoQuery();
  const userId = userInfo?._id;

  const { data: downloadHistory, isLoading: isDownloadLoading } =
    useUserDownloadHistoryQuery(userId, {
      skip: !userId,
    });

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleSingleZipFileDownload = async ({ id, extension }) => {
    const token = Cookies.get('token');
    const headers = new Headers();

    if (token) headers.set('Authorization', `Bearer ${token}`);

    try {
      setLoadingId(id);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/redownload/product/${id}/extension/${extension}`,
        { method: 'GET', headers },
      );

      if (!res.ok) throw new Error(`Download failed with status ${res.status}`);

      const blob = await res.blob();
      const filename = `From_Embroid_${extension}.zip`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      ErrorToast(
        'Download Failed',
        err?.message || 'Could not download file',
        3000,
      );
    } finally {
      setLoadingId(null);
    }
  };

  const renderDownloadItem = (design) => {
    const { _id, downloadedAt, fileType, product, user } = design;
    const imageUrl = product?.image?.url ?? '/fallback-image.png';

    return (
      <div
        key={_id}
        className='flex flex-col sm:flex-row gap-4 bg-white shadow-md rounded-lg p-4 mb-4'
      >
        {/* Image and Info */}
        <div className='flex flex-1 items-start gap-4 sm:text-xs sm:gap-2'>
          <img
            src={imageUrl}
            alt={product?.name || 'Design'}
            className='w-20 h-20 object-cover rounded'
          />
          <div className='flex flex-col justify-between sm:text-xs sm:gap-2'>
            <h3 className='text-base font-semibold text-gray-800 sm:text-xs sm:gap-2'>
              {product?.name}
            </h3>
            {/* <p className="text-sm text-gray-500 text-wrap sm:text-xs sm:gap-2">{user?.email}</p> */}
            <p className='text-sm text-gray-500 text-wrap sm:text-xs sm:gap-2'>
              {user?.name}
            </p>
            <p className='text-sm font-semibold text-gray-500'>
              File: <span className='uppercase'>{fileType}</span>
            </p>
          </div>
        </div>

        {/* Date and Action */}
        <div className='flex sm:flex-row sm:items-center justify-between sm:w-1/2'>
          {/* Date */}
          <div className='text-sm text-gray-500 flex items-center'>
            {new Date(downloadedAt).toISOString().split('T')[0]}
          </div>

          {/* Action */}
          <div className='flex justify-end'>
            {loadingId === product?._id ? (
              <LoadingSpinner />
            ) : (
              <button
                onClick={() =>
                  handleSingleZipFileDownload({
                    extension: fileType,
                    id: product?._id,
                  })
                }
                className='button'
                disabled={!!loadingId}
              >
                <i className='ri-download-fill' /> Download
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDownloadTab = useMemo(() => {
    if (isDownloadLoading) return <LoadingSpinner />;
    if (downloadHistory?.data?.length === 0)
      return <p className='text-center'>No downloads data found.</p>;

    return (
      <div className='max-w-5xl mx-auto p-4 sm:p-6 bg-blue-50 rounded-lg shadow-md'>
        <div className='hidden sm:flex justify-between text-sm text-gray-500 uppercase mb-3'>
          <h2>Details</h2>
          <h2>Date</h2>
          <h2>Actions</h2>
        </div>
        {downloadHistory?.data.map(renderDownloadItem)}
      </div>
    );
  }, [downloadHistory, loadingId]);

  return (
    <div className='py-10'>
      {/* Tabs */}
      <div className='flex items-center justify-center'>
        <Tabs
          aria-label='User Tabs'
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          color='secondary'
          variant='bordered'
          size='sm'
          placement='top'
          className='bg-white !border-black '
        >
          <Tab
            key='account'
            title={
              <div className='flex items-center justify-start space-x-2  text-xs md:text-xl'>
                <i className='ri-account-circle-fill ' />
                <span>Account</span>
              </div>
            }
          />
          <Tab
            key='password'
            title={
              <div className='flex items-center space-x-2  text-xs md:text-xl'>
                <i className='ri-lock-password-fill ' />
                <span>Change Password</span>
              </div>
            }
          />
          <Tab
            key='downloads'
            title={
              <div className='flex items-center space-x-2 text-xs md:text-xl'>
                <i className='ri-download-fill ' />
                <span>Downloads</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className='w-full px-4 sm:px-6 mt-6'>
        {activeTab === 'account' && <UserProfile />}
        {activeTab === 'downloads' && renderDownloadTab}
        {activeTab === 'password' && <ChangePasswordForm />}
      </div>
    </div>
  );
}
