'use client';

import { Tab, Tabs } from '@heroui/react';
import { useEffect, useState } from 'react';
import UserProfile from './UserProfile';

export default function UserDetailsComponent({ defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  return (
    <>
      <div className='flex w-full flex-col items-start justify-start'>
        <Tabs
          aria-label='User Details Tabs'
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key)}
          color='secondary'
          variant='bordered'
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
          <div className='text-gray-500'>Downloads tab content goes here</div>
        )}
      </div>
    </>
  );
}
