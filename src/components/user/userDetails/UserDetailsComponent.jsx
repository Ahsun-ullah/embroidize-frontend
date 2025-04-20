'use client';

import {
  useUserDownloadHistoryQuery,
  useUserInfoQuery,
} from '@/lib/redux/common/user/userInfoSlice';
import { Tab, Tabs } from '@heroui/react';
import { useEffect, useState } from 'react';
import UserProfile from './UserProfile';

export default function UserDetailsComponent({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const { data: userInfo } = useUserInfoQuery();
  const { data: UserDownloadHistory } = useUserDownloadHistoryQuery(
    userInfo?._id,
    {
      skip: !userInfo?._id,
      refetchonmountandargchange: true,
    },
  );
  console.log(userInfo);

  // const fetchUserDownloads = async () => {
  //   try {
  //     const token = Cookies.get('token');
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/downloads/user/${userInfo?._id}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );

  //     if (!response.ok) {
  //       // Handle API errors
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || 'Failed to fetch downloads');
  //     }

  //     const data = await response.json();
  //     console.log('User Downloads:', data);
  //     return data;
  //   } catch (error) {
  //     console.error('Error fetching downloads:', error.message);
  //     return null;
  //   }
  // };

  // const result = fetchUserDownloads();

  console.log(UserDownloadHistory);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <>
      <div className='flex w-full flex-col items-center justify-center bg-blue-50 py-6 rounded-xl'>
        <Tabs
          aria-label='User Details Tabs'
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key)}
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
        {activeTab === 'downloads' && (
          <div className='max-w-4xl mx-auto p-6 bg-blue-50 rounded-lg shadow-md  '>
            {/* Header */}
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-gray-500 uppercase text-sm'>Details</h2>
              <h2 className='text-gray-500 uppercase text-sm'>Date</h2>
              <h2 className='text-gray-500 uppercase text-sm'>Actions</h2>
            </div>

            {/* Design Items */}
            {UserDownloadHistory?.data.map((design) => (
              <div
                key={design.id}
                className='flex items-center justify-between bg-white shadow-md rounded-lg p-4 mb-4'
              >
                <div className='w-24 h-24 mr-4 flex items-center gap-x-4'>
                  <img
                    src={design.product?.image?.url}
                    alt={design.product?.name}
                    className='w-full h-full object-cover rounded'
                  />
                  <div className='flex-1'>
                    <h3 className='text-sm font-semibold text-gray-800 text-wrap'>
                      {design.product?.name}
                    </h3>
                    <p className='text-sm text-gray-500'>
                      by {/* {design?.user?.name} */}
                      <span>{design?.user?.email}</span>
                    </p>
                  </div>
                </div>

                <div className='text-sm text-gray-500 text-center flex items-start justify-start'>
                  {new Date(design.downloadedAt).toDateString()}
                </div>

                <div className='flex space-x-2'>
                  <button className='button'>
                    <i className='ri-download-fill' /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
