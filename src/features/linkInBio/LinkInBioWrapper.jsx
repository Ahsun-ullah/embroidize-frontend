'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { Button, Chip, Input, Spinner, Tooltip } from '@heroui/react';
import { Check, Copy, ExternalLink, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const PUBLIC_URL = 'https://embroidize.com/instagram-embroidery-designs';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function jsonHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function call(path, options = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers: jsonHeaders(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  return body;
}

// Admin → Content → Links Page. Picks which designs show on
// embroidize.com/instagram-embroidery-designs (the Instagram bio link) and in what order.
export default function LinkInBioWrapper({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState(false);

  // Picker: empty query lists the latest uploads, otherwise a catalogue search.
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState({}); // productId -> product
  const [copied, setCopied] = useState(false);

  const onPage = useMemo(
    () => new Set(items.map((i) => i.product?._id).filter(Boolean)),
    [items],
  );
  const selectedList = Object.values(selected);

  useEffect(() => {
    const q = query.trim();
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({ page: '1', limit: '24' });
          if (q) params.set('search', q);
          const res = await fetch(`${apiBase()}/public/product?${params}`);
          const body = await res.json();
          if (!cancelled) setResults(body?.data?.data || []);
        } catch {
          if (!cancelled) setResults([]);
        } finally {
          if (!cancelled) setSearching(false);
        }
      },
      q ? 300 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const toggleSelect = (p) => {
    if (onPage.has(p._id)) return;
    setSelected((s) => {
      const next = { ...s };
      if (next[p._id]) delete next[p._id];
      else next[p._id] = p;
      return next;
    });
  };

  const addSelected = async () => {
    if (!selectedList.length) return;
    // The backend puts each id it receives on top of the previous one, so
    // send oldest upload first: the newest upload ends up first on the page.
    const ids = [...selectedList]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((p) => p._id);
    setBusy(true);
    try {
      const body = await call('/admin/link-in-bio', {
        method: 'POST',
        body: JSON.stringify({ productIds: ids }),
      });
      setItems(body.data || []);
      setSelected({});
      SuccessToast('Done', body.message || 'Added', 2500);
    } catch (e) {
      ErrorToast('Could not add', e.message, 4000);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    const prev = items;
    setItems(items.filter((i) => i._id !== item._id));
    try {
      await call(`/admin/link-in-bio/${item._id}`, { method: 'DELETE' });
    } catch (e) {
      setItems(prev);
      ErrorToast('Could not remove', e.message, 4000);
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      ErrorToast('Copy failed', PUBLIC_URL, 3000);
    }
  };

  return (
    <>
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Links Page</h1>
            <p className='mt-1 max-w-2xl text-sm text-gray-600'>
              The page for your Instagram bio. Pick designs below; the newest
              pick shows first and each tile opens that design&apos;s page.
              Unpublished designs are hidden automatically. Visits from this
              page appear in Google Analytics under Reports → Acquisition →
              Traffic acquisition as <b>instagram / social</b>.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <code className='rounded bg-gray-100 px-2 py-1 text-sm'>
              {PUBLIC_URL.replace('https://', '')}
            </code>
            <Tooltip content={copied ? 'Copied' : 'Copy link'}>
              <Button isIconOnly size='sm' variant='flat' onPress={copyUrl}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content='Open page'>
              <Button
                isIconOnly
                size='sm'
                variant='flat'
                as='a'
                href='/instagram-embroidery-designs'
                target='_blank'
                rel='noopener'
              >
                <ExternalLink size={16} />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Current page, in display order */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='font-semibold text-gray-900'>
            On the page{' '}
            <span className='font-normal text-gray-500'>({items.length})</span>
          </h2>
        </div>
        {items.length ? (
          <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {items.map((item, i) => {
              const p = item.product;
              return (
                <li
                  key={item._id}
                  className='overflow-hidden rounded-lg border border-gray-200'
                >
                  <div className='relative aspect-[3/2] bg-white'>
                    {p?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.name}
                        loading='lazy'
                        className='h-full w-full object-cover'
                      />
                    ) : null}
                    <span className='absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white'>
                      {i + 1}
                    </span>
                    {!p ? (
                      <Chip
                        size='sm'
                        color='danger'
                        className='absolute bottom-1 left-1'
                      >
                        Deleted
                      </Chip>
                    ) : !p.isActive ? (
                      <Chip
                        size='sm'
                        color='warning'
                        className='absolute bottom-1 left-1'
                      >
                        Hidden
                      </Chip>
                    ) : null}
                  </div>
                  <div className='p-2'>
                    <p
                      className='truncate text-xs text-gray-800'
                      title={p?.name}
                    >
                      {p?.name || 'Deleted design'}
                    </p>
                    <div className='mt-1 flex items-center justify-end'>
                      <Tooltip content='Remove from page'>
                        <Button
                          isIconOnly
                          size='sm'
                          variant='light'
                          color='danger'
                          onPress={() => remove(item)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='text-sm text-gray-500'>
            Nothing yet. Pick designs below to fill the page.
          </p>
        )}
      </div>

      {/* Picker */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='font-semibold text-gray-900'>
            {query.trim() ? 'Search results' : 'Latest uploads'}
          </h2>
          <div className='flex flex-1 items-center justify-end gap-2'>
            <Input
              size='sm'
              className='max-w-xs'
              placeholder='Search by name, serial or SKU'
              startContent={<Search size={14} />}
              value={query}
              onValueChange={setQuery}
              isClearable
              onClear={() => setQuery('')}
            />
            <Button
              color='primary'
              size='sm'
              isDisabled={!selectedList.length}
              isLoading={busy}
              onPress={addSelected}
            >
              Add {selectedList.length || ''} to page
            </Button>
          </div>
        </div>
        {searching && !results.length ? (
          <div className='flex justify-center py-8'>
            <Spinner size='sm' />
          </div>
        ) : results.length ? (
          <ul className='grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'>
            {results.map((p) => {
              const added = onPage.has(p._id);
              const isSel = !!selected[p._id];
              return (
                <li key={p._id}>
                  <button
                    type='button'
                    onClick={() => toggleSelect(p)}
                    disabled={added}
                    title={p.name}
                    className={`relative block w-full overflow-hidden rounded-lg border-2 text-left ${
                      isSel
                        ? 'border-primary'
                        : 'border-transparent hover:border-gray-300'
                    } ${added ? 'cursor-default opacity-50' : ''}`}
                  >
                    <div className='aspect-[3/2] bg-white'>
                      {p.image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image.url}
                          alt={p.name}
                          loading='lazy'
                          className='h-full w-full object-cover'
                        />
                      ) : null}
                    </div>
                    <p className='truncate px-1 py-1 text-[11px] text-gray-700'>
                      {p.name}
                    </p>
                    {(added || isSel) && (
                      <span className='absolute right-1 top-1 rounded-full bg-primary p-0.5 text-white'>
                        <Check size={12} />
                      </span>
                    )}
                    {added && (
                      <span className='absolute left-1 top-1 rounded bg-black/70 px-1 text-[10px] text-white'>
                        On page
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='text-sm text-gray-500'>No designs found.</p>
        )}
      </div>
    </>
  );
}
