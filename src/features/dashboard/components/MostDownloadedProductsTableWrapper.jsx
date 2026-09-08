'use client';
import { Button, Chip, Input, Pagination } from '@heroui/react';
import { Download, ExternalLink, Heart, ImageOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MostDownloadedProductsTableWrapper({
  initialData,
  pagination,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const [dateInputs, setDateInputs] = useState({
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
  });

  // Search box state. Held locally so typing stays responsive, and pushed to
  // the URL on submit rather than per keystroke — every change here refetches
  // on the server, and the download aggregation is not cheap enough to run on
  // each letter.
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );

  // Keep the box in step with the URL when the param changes from elsewhere:
  // the Clear-all button, a pasted link, or the browser's back button.
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
  }, [searchParams]);

  // Track active preset for UI highlighting
  // 'all' is default unless URL has dates, then it's 'custom'
  const [activePreset, setActivePreset] = useState(
    searchParams.get('startDate') ? 'custom' : 'all',
  );

  // Whether the numbers on the cards are range-scoped counts rather than each
  // design's lifetime total. The tier params count too: filtered to premium
  // downloads by subscribers, a lifetime download count would silently include
  // every other tier.
  const hasFilter = !!(
    searchParams.get('startDate') ||
    searchParams.get('endDate') ||
    searchParams.get('userTier') ||
    searchParams.get('productTier')
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
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const applyPreset = (value, unit, label) => {
    // 1. Set Active State for UI
    setActivePreset(label);

    // 2. Handle 'ALL' (Clear filters)
    if (value === 'all') {
      setDateInputs({ startDate: '', endDate: '' });
      setActivePreset('ALL');
      // Clear the dates only — an active tier filter is a separate control with
      // its own clear button, and wiping it here would fight the cards above.
      const params = new URLSearchParams(searchParams.toString());
      params.delete('startDate');
      params.delete('endDate');
      params.delete('page');
      const qs = params.toString();
      router.push(qs ? `?${qs}` : window.location.pathname);
      return;
    }

    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    // 3. Handle Specific Day Presets
    if (value === 'today') {
    } else if (value === 'yesterday') {
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

  const submitSearch = () => updateURL({ search: searchValue.trim() });

  const clearSearch = () => {
    setSearchValue('');
    updateURL({ search: '' });
  };

  const onPageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const data = Array.isArray(initialData) ? initialData : [];
  const pages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || 1;

  // --- Filter Bar UI ---
  const topContent = (
    <div className='flex flex-col gap-4 mb-6'>
      <div className='flex flex-wrap gap-3 items-end justify-between'>
        {/* Preset Buttons */}
        <div className='flex flex-wrap gap-1 bg-gray-100 dark:bg-neutral-800 rounded-lg p-1'>
          {[
            { label: 'Today', value: 'today', unit: null },
            { label: 'Yesterday', value: 'yesterday', unit: null },
            { label: 'Last 24h', value: 1, unit: 'days' },
            { label: '3D', value: 3, unit: 'days' },
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

        {/* Search by design name, SKU or slug */}
        <div className='flex gap-2 items-center'>
          <Input
            aria-label='Search downloaded designs'
            className='w-60'
            placeholder='Search name, SKU or slug...'
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSearch();
            }}
            isClearable
            onClear={clearSearch}
          />
          <Button size='sm' variant='flat' onPress={submitSearch}>
            Search
          </Button>
        </div>

        <div className='flex gap-2 items-center'>
          {pagination?.totalDownloads !== undefined && (
            <div className='mb-0 font-semibold text-lg'>
              Total {pagination?.totalDownloads || 0} File Downloads
            </div>
          )}
        </div>

        {/* Date Inputs */}
        <div className='flex gap-2 items-center'>
          <Input
            type='date'
            aria-label='Start Date'
            className='w-36'
            value={dateInputs.startDate}
            onChange={(e) => handleManualDateChange('startDate', e.target.value)}
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
    <div>
      {topContent}

      {data.length === 0 ? (
        <div className='py-16 text-center text-gray-400'>
          {searchParams.get('search')
            ? `No downloaded designs match "${searchParams.get('search')}" in this date range.`
            : 'No data found'}
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
          {data.map((item) => {
            const product = item.product || {};
            const slug = product.slug;
            const imageUrl = product.image?.url;
            const downloadCount = hasFilter
              ? (item.downloadCount ?? 0)
              : (product.downloadCount ?? 0);
            const favoriteCount = product.favoriteCount ?? 0;

            return (
              <div
                key={item._id}
                className='group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow'
              >
                {/* ── Focused image (larger) ── */}
                <Link
                  href={slug ? `/product/${slug}` : '#'}
                  target={slug ? '_blank' : undefined}
                  rel='noopener noreferrer'
                  className='relative block aspect-[16/10] bg-gray-50 overflow-hidden'
                  title={slug ? 'Open product page' : undefined}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={product.name || 'design'}
                      className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-300'>
                      <ImageOff size={48} />
                    </div>
                  )}
                </Link>

                {/* ── Data ── */}
                <div className='p-3 flex flex-col gap-2 flex-1'>
                  <Link
                    href={slug ? `/product/${slug}` : '#'}
                    target={slug ? '_blank' : undefined}
                    rel='noopener noreferrer'
                    className='font-semibold text-sm leading-snug line-clamp-2 hover:underline'
                  >
                    {product.name || '—'}
                  </Link>

                  <div className='text-xs text-gray-700 space-y-0.5'>
                    <p className='flex gap-1'>
                      <span className='text-gray-400 shrink-0'>Category:</span>
                      <span className='font-medium line-clamp-1'>
                        {product.category?.name || '—'}
                      </span>
                    </p>
                    <p className='flex gap-1'>
                      <span className='text-gray-400 shrink-0'>Subcategory:</span>
                      <span className='font-medium line-clamp-1'>
                        {product.sub_category?.name || '—'}
                      </span>
                    </p>
                  </div>

                  {/* Stats row: downloads + favourites (compact) */}
                  <div className='grid grid-cols-2 gap-1.5'>
                    <div
                      className='flex items-center justify-center gap-1 rounded-md bg-gradient-to-br from-gray-900 to-gray-700 text-white py-1'
                      title={`${downloadCount} downloads`}
                    >
                      <Download size={12} />
                      <span className='text-xs font-bold leading-none'>
                        {downloadCount}
                      </span>
                    </div>
                    <div
                      className='flex items-center justify-center gap-1 rounded-md border border-gray-300 py-1'
                      title={`${favoriteCount} favourites`}
                    >
                      <Heart size={12} className='fill-gray-900 text-gray-900' />
                      <span className='text-xs font-bold leading-none'>
                        {favoriteCount}
                      </span>
                    </div>
                  </div>

                  {item.fileTypes?.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {item.fileTypes.map((ft) => (
                        <Chip
                          key={ft}
                          size='sm'
                          variant='flat'
                          className='uppercase text-[10px] h-5'
                        >
                          {ft}
                        </Chip>
                      ))}
                    </div>
                  )}

                  <div className='mt-auto pt-1'>
                    <Button
                      as={Link}
                      href={slug ? `/product/${slug}` : '#'}
                      target={slug ? '_blank' : undefined}
                      isDisabled={!slug}
                      size='sm'
                      variant='flat'
                      fullWidth
                      endContent={<ExternalLink size={14} />}
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className='flex justify-center mt-8'>
          <Pagination
            isCompact
            showControls
            showShadow
            color='primary'
            page={currentPage}
            total={pages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
