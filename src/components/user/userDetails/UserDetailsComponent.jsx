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
      // refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleSingleZipFileDownload = async ({ id, extension }) => {
    const token = Cookies.get('token');
    const headers = new Headers();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      setLoadingId(id);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/redownload/product/${id}/extension/${extension}`,
        { method: 'GET', headers },
      );

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }

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
        className='flex items-center justify-between bg-white shadow-md rounded-lg p-4 mb-4'
      >
        {/* Image and Name */}
        <div className='flex items-center gap-4 w-1/2'>
          <img
            src={imageUrl}
            alt={product?.name || 'Design'}
            className='w-24 h-24 object-cover rounded'
          />
          <div>
            <h3 className='text-sm font-semibold text-gray-800'>
              {product?.name}
            </h3>
            <p className='text-sm text-gray-500'>by {user?.email}</p>
            <p className='text-sm font-semibold text-gray-500'>
              File:{' '}
              <span
                className='
               uppercase'
              >
                {fileType}
              </span>
            </p>
          </div>
        </div>

        {/* Date */}
        <div className='text-sm text-gray-500 text-start'>
          {new Date(downloadedAt).toDateString()}
        </div>

        {/* Action */}
        <div className='w-1/4 flex justify-end'>
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
    );
  };

  const renderDownloadTab = useMemo(() => {
    if (isDownloadLoading) return <LoadingSpinner />;
    if (downloadHistory?.data?.length === 0)
      return <p className='text-center'>No downloads data found.</p>;

    return (
      <div className='max-w-4xl mx-auto p-6 bg-blue-50 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-4 text-sm text-gray-500 uppercase'>
          <h2>Details</h2>
          <h2>Date</h2>
          <h2>Actions</h2>
        </div>
        {downloadHistory?.data.map(renderDownloadItem)}
      </div>
    );
  }, [downloadHistory, loadingId]);

  return (
    <>
      {/* Tabs */}
      <div className='flex w-full flex-col items-center justify-center bg-blue-50 py-6 rounded-xl'>
        <Tabs
          aria-label='User Details Tabs'
          selectedKey={activeTab}
          onSelectionChange={setActiveTab}
          color='secondary'
          variant='bordered'
          size='lg'
        >
          <Tab
            key='account'
            title={
              <div className='flex items-center space-x-2'>
                <i className='ri-account-circle-fill text-xl' />
                <span>Account</span>
              </div>
            }
          />
          <Tab
            key='password'
            title={
              <div className='flex items-center space-x-2'>
                <i className='ri-lock-password-fill text-2xl' />
                <span>Change Password</span>
              </div>
            }
          />
          <Tab
            key='downloads'
            title={
              <div className='flex items-center space-x-2'>
                <i className='ri-download-fill text-2xl' />
                <span>Downloads</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className='w-full mt-6'>
        {activeTab === 'account' && <UserProfile />}
        {activeTab === 'downloads' && renderDownloadTab}
        {activeTab === 'password' && <ChangePasswordForm />}
      </div>
    </>
  );
}
