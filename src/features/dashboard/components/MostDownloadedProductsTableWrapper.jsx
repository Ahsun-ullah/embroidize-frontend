'use client';
import UserTable from '@/components/Common/Table';
import { VerticalDotsIcon } from '@/components/icons';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  User,
} from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export default function MostDownloadedProductsTableWrapper({
  initialData,
  columns,
  pageSize,
  pagination,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const [dateInputs, setDateInputs] = useState({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  // Track active preset for UI highlighting
  // 'all' is default unless URL has dates, then it's 'custom'
  const [activePreset, setActivePreset] = useState(
    searchParams.get('startDate') ? 'custom' : 'all',
  );

  // --- Filter Logic (URL Based) ---
  const updateURL = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update keys
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });

    // Reset to page 1 on filter change
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const applyPreset = (value, unit, label) => {
    // 1. Set Active State for UI
    setActivePreset(label); // e.g., 'Today', '1M', 'ALL'

    // 2. Handle 'ALL' (Clear filters)
    if (value === 'all') {
      setDateInputs({ startDate: '', endDate: '' });
      updateURL({ startDate: '', endDate: '' });
      return;
    }

    const today = new Date();
    let start = new Date(today); // Clone today
    let end = new Date(today); // Clone today

    // 3. Handle Specific Day Presets
    if (value === 'today') {
      // Start = Today, End = Today
    } else if (value === 'yesterday') {
      // Start = Yesterday, End = Yesterday
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    }
    // 4. Handle Ranges (1D, 7D, 1M etc.)
    else if (unit === 'days') {
      start.setDate(today.getDate() - value);
    } else if (unit === 'months') {
      start.setMonth(today.getMonth() - value);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setDateInputs({ startDate: startStr, endDate: endStr });
    updateURL({ startDate: startStr, endDate: endStr });
  };

  // If user manually changes date input, set preset to 'custom'
  const handleManualDateChange = (key, val) => {
    setActivePreset('custom');
    setDateInputs((prev) => ({ ...prev, [key]: val }));
    updateURL({ [key]: val });
  };

  const onPageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const renderCell = useCallback((item, columnKey) => {
    if (!item?.product) return <span>-</span>;
    const cellValue = item.product[columnKey];

    switch (columnKey) {
      case 'name':
        return (
          <User
            avatarProps={{ radius: 'lg', src: item.product.image?.url }}
            name={cellValue}
          >
            {item.product.name}
          </User>
        );
      case 'category':
        return <>{item.product.category?.name || '-'}</>;
      case 'sub_category':
        return <>{item.product.sub_category?.name || '-'}</>;
      case 'totalDownloads':
        return <>{item.totalDownloads}</>; // Fixed: Show actual download count
      case 'fileType':
        return <p className='uppercase'>{item.fileType || '-'}</p>;
      case 'actions':
        return (
          <div className='relative flex justify-center items-center gap-2'>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size='sm' variant='light'>
                  <VerticalDotsIcon className='text-default-300' />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key='view'>View Details</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  // --- Filter Bar UI ---
  const topContent = (
    <div className='flex flex-col gap-4 mb-4'>
      <div className='flex flex-wrap gap-3 items-end justify-between'>
        {/* Preset Buttons */}
        <div className='flex flex-wrap gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1'>
          {[
            { label: 'Today', value: 'today', unit: null },
            { label: 'Yesterday', value: 'yesterday', unit: null },
            { label: 'Last 24h', value: 1, unit: 'days' },
            { label: '7D', value: 7, unit: 'days' },
            { label: '15D', value: 15, unit: 'days' },
            { label: '1M', value: 1, unit: 'months' },
            { label: '3M', value: 3, unit: 'months' },
            { label: '6M', value: 6, unit: 'months' },
            { label: 'ALL', value: 'all', unit: null },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => applyPreset(btn.value, btn.unit, btn.label)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${
                  activePreset === btn.label
                    ? 'bg-white dark:bg-neutral-600 text-black dark:text-white shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className='flex gap-2 items-center'>
          <Input
            type='date'
            aria-label='Start Date'
            className='w-36'
            value={dateInputs.startDate}
            onChange={(e) =>
              handleManualDateChange('startDate', e.target.value)
            }
          />
          <span className='text-gray-400'>-</span>
          <Input
            type='date'
            aria-label='End Date'
            className='w-36'
            value={dateInputs.endDate}
            onChange={(e) => handleManualDateChange('endDate', e.target.value)}
          />

          {/* Clear Button */}
          {(dateInputs.startDate || dateInputs.endDate) && (
            <button
              className='text-red-500 hover:text-red-700 font-bold ml-2'
              onClick={() => applyPreset('all', null, 'ALL')}
              title='Clear dates'
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <UserTable
      data={initialData}
      columns={columns}
      pageSize={pageSize}
      renderCell={renderCell}
      onPageChange={onPageChange}
      pagination={pagination}
      topContent={topContent}
    />
  );
}
