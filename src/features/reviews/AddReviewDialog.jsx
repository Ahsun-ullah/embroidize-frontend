'use client';

// Admin composer for a review the customer did not type themselves — feedback
// that arrived by email or WhatsApp, say. Pick the customer and the review is
// indistinguishable from one they wrote (their name and avatar, their
// one-review-per-design limit). Pick nobody and the product page shows it as
// "Anonymous".
//
// Loaded with next/dynamic from ReviewsWrapper, so none of this ships with the
// reviews table.

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from '@heroui/react';
import { Check, ImagePlus, Search, Star, User, UserX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MAX_IMAGES = 3;
const MAX_TEXT = 1000;

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Shared shell for the two pickers so the design and the customer rows look and
// behave the same: type, pick from the results, or clear what you picked.
function Picker({
  label,
  hint,
  placeholder,
  query,
  onQuery,
  results,
  loading,
  selected,
  renderSelected,
  renderResult,
  onSelect,
  onClear,
  disabled,
}) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-baseline justify-between gap-2'>
        <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
          {label}
        </span>
        {hint && <span className='text-[11px] text-gray-400'>{hint}</span>}
      </div>

      {selected ? (
        <div className='flex items-center gap-2 rounded-lg border border-gray-900 bg-gray-50 px-3 py-2'>
          <div className='min-w-0 flex-1'>{renderSelected(selected)}</div>
          <Button
            size='sm'
            variant='light'
            isIconOnly
            aria-label={`Clear ${label}`}
            isDisabled={disabled}
            onPress={onClear}
          >
            <X size={15} />
          </Button>
        </div>
      ) : (
        <div className='rounded-lg border border-gray-200'>
          <div className='flex items-center gap-2 px-3 py-2'>
            <Search size={15} className='shrink-0 text-gray-400' />
            <input
              type='text'
              value={query}
              disabled={disabled}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={placeholder}
              className='w-full bg-transparent text-sm outline-none placeholder:text-gray-400'
            />
            {loading && (
              <span className='shrink-0 text-[11px] text-gray-400'>…</span>
            )}
          </div>

          {query.trim().length >= 2 && (
            <div className='max-h-44 overflow-y-auto border-t border-gray-100'>
              {results.length === 0 && !loading ? (
                <p className='px-3 py-3 text-xs text-gray-400'>No matches.</p>
              ) : (
                results.map((item) => (
                  <button
                    key={item._id}
                    type='button'
                    onClick={() => onSelect(item)}
                    className='flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-gray-50'
                  >
                    {renderResult(item)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddReviewDialog({ isOpen, onOpenChange, onPosted }) {
  // ── Design picker ──
  const [productQuery, setProductQuery] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [product, setProduct] = useState(null);

  // ── Customer picker. null means anonymous — that is the whole mechanism. ──
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  const fileRef = useRef(null);

  const reset = () => {
    setProductQuery('');
    setProductResults([]);
    setProduct(null);
    setUserQuery('');
    setUserResults([]);
    setUser(null);
    setRating(0);
    setHoverRating(0);
    setText('');
    setImages([]);
  };

  // Debounced design lookup. Reuses the storefront suggest endpoint, which
  // already has an Atlas Search path with a regex fallback.
  useEffect(() => {
    const q = productQuery.trim();
    if (product || q.length < 2) {
      setProductResults([]);
      return;
    }
    let cancelled = false;
    setProductLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiBase()}/public/search/suggest?q=${encodeURIComponent(q)}`,
        );
        const body = await res.json();
        if (!cancelled) setProductResults(body?.data?.products || []);
      } catch {
        if (!cancelled) setProductResults([]);
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [productQuery, product]);

  // Debounced customer lookup against the admin users list.
  useEffect(() => {
    const q = userQuery.trim();
    if (user || q.length < 2) {
      setUserResults([]);
      return;
    }
    let cancelled = false;
    setUserLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiBase()}/all-users?search=${encodeURIComponent(q)}&perPage=8`,
          { headers: authHeader() },
        );
        const body = await res.json();
        if (!cancelled) setUserResults(body?.data?.users || []);
      } catch {
        if (!cancelled) setUserResults([]);
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [userQuery, user]);

  const onPickImages = (e) => {
    const picked = Array.from(e.target.files || []);
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      ErrorToast('Limit reached', `At most ${MAX_IMAGES} photos.`, 3000);
      return;
    }
    const valid = picked.filter((f) => f.type.startsWith('image/'));
    if (valid.length !== picked.length) {
      ErrorToast('Skipped', 'Only image files can be attached.', 3000);
    }
    setImages((prev) => [...prev, ...valid.slice(0, room)]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (close) => {
    if (!product) {
      ErrorToast('Pick a design', 'Choose which design this review is for.', 3000);
      return;
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      ErrorToast('Pick a rating', 'Choose between 1 and 5 stars.', 3000);
      return;
    }
    setIsPosting(true);
    try {
      const form = new FormData();
      // Omitted entirely when nobody is selected — the backend reads a missing
      // userId as "post this anonymously".
      if (user?._id) form.append('userId', user._id);
      form.append('rating', String(rating));
      if (text.trim()) form.append('reviewText', text.trim());
      images.forEach((img) => form.append('images', img));

      const res = await fetch(
        `${apiBase()}/admin/products/${product._id}/reviews`,
        { method: 'POST', headers: authHeader(), body: form },
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || 'Failed to post review');

      SuccessToast(
        'Review posted',
        user?.name
          ? `Added to ${product.name} as ${user.name}.`
          : `Added to ${product.name} anonymously.`,
        4000,
      );
      reset();
      close?.();
      onPosted?.();
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to post review', 5000);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) reset();
        onOpenChange(open);
      }}
      size='2xl'
      scrollBehavior='inside'
      backdrop='blur'
    >
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className='flex flex-col gap-0.5'>
              <span className='text-base font-semibold'>Post a review</span>
              <span className='text-xs font-normal text-gray-500'>
                For feedback a customer sent you directly.
              </span>
            </ModalHeader>

            <ModalBody className='gap-5'>
              <Picker
                label='Design'
                placeholder='Search designs by name or serial…'
                query={productQuery}
                onQuery={setProductQuery}
                results={productResults}
                loading={productLoading}
                selected={product}
                disabled={isPosting}
                onSelect={setProduct}
                onClear={() => {
                  setProduct(null);
                  setProductQuery('');
                }}
                renderSelected={(p) => (
                  <div className='flex items-center gap-2'>
                    {p.image?.url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.image.url}
                        alt=''
                        className='h-8 w-8 shrink-0 rounded object-cover'
                      />
                    )}
                    <span className='truncate text-sm font-medium text-gray-900'>
                      {p.name}
                    </span>
                  </div>
                )}
                renderResult={(p) => (
                  <>
                    {p.image?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.image.url}
                        alt=''
                        loading='lazy'
                        className='h-7 w-7 shrink-0 rounded object-cover'
                      />
                    ) : (
                      <div className='h-7 w-7 shrink-0 rounded bg-gray-100' />
                    )}
                    <span className='truncate text-sm text-gray-700'>
                      {p.name}
                    </span>
                  </>
                )}
              />

              <Picker
                label='Reviewer'
                hint='Leave empty to post anonymously'
                placeholder='Search customers by name or email…'
                query={userQuery}
                onQuery={setUserQuery}
                results={userResults}
                loading={userLoading}
                selected={user}
                disabled={isPosting}
                onSelect={setUser}
                onClear={() => {
                  setUser(null);
                  setUserQuery('');
                }}
                renderSelected={(u) => (
                  <div className='flex items-center gap-2'>
                    <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-bold text-white'>
                      {(u.name || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-medium text-gray-900'>
                        {u.name}
                      </div>
                      <div className='truncate text-[11px] text-gray-500'>
                        {u.email}
                      </div>
                    </div>
                  </div>
                )}
                renderResult={(u) => (
                  <>
                    <User size={14} className='shrink-0 text-gray-400' />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-sm text-gray-700'>
                        {u.name}
                      </span>
                      <span className='block truncate text-[11px] text-gray-400'>
                        {u.email}
                      </span>
                    </span>
                  </>
                )}
              />

              {/* Says plainly which of the two modes the form is in. */}
              <div className='flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600'>
                {user ? (
                  <>
                    <User size={14} className='shrink-0 text-gray-500' />
                    <span>
                      Will appear as{' '}
                      <span className='font-semibold text-gray-900'>
                        {user.name}
                      </span>
                      , exactly like a review they wrote themselves.
                    </span>
                  </>
                ) : (
                  <>
                    <UserX size={14} className='shrink-0 text-gray-500' />
                    <span>
                      No customer selected — will appear as{' '}
                      <span className='font-semibold text-gray-900'>
                        Anonymous
                      </span>
                      .
                    </span>
                  </>
                )}
              </div>

              <div className='space-y-1.5'>
                <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  Rating
                </span>
                <div
                  className='flex items-center gap-1'
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type='button'
                      disabled={isPosting}
                      aria-label={`${n} star${n === 1 ? '' : 's'}`}
                      onMouseEnter={() => setHoverRating(n)}
                      onClick={() => setRating(n)}
                      className='rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-gray-900'
                    >
                      <Star
                        size={26}
                        className={
                          n <= (hoverRating || rating)
                            ? 'fill-gray-900 text-gray-900'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                  <span className='ml-2 text-xs text-gray-400'>
                    {rating ? `${rating} of 5` : 'Required'}
                  </span>
                </div>
              </div>

              <div className='space-y-1.5'>
                <div className='flex items-baseline justify-between'>
                  <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Review
                  </span>
                  <span className='text-[11px] text-gray-400'>
                    {text.length}/{MAX_TEXT}
                  </span>
                </div>
                <Textarea
                  value={text}
                  onValueChange={(v) => setText(v.slice(0, MAX_TEXT))}
                  isDisabled={isPosting}
                  minRows={4}
                  placeholder='What the customer told you, in their words…'
                />
              </div>

              <div className='space-y-1.5'>
                <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
                  Photos{' '}
                  <span className='font-normal normal-case text-gray-400'>
                    optional, up to {MAX_IMAGES}
                  </span>
                </span>
                <div className='flex flex-wrap items-center gap-2'>
                  {images.map((img, i) => (
                    <div
                      key={`${img.name}-${i}`}
                      className='group relative h-16 w-16 overflow-hidden rounded-lg ring-1 ring-inset ring-gray-200'
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(img)}
                        alt={img.name}
                        className='h-full w-full object-cover'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setImages((prev) => prev.filter((_, x) => x !== i))
                        }
                        className='absolute right-0.5 top-0.5 rounded-full bg-gray-900/80 p-0.5 text-white'
                        aria-label={`Remove ${img.name}`}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {images.length < MAX_IMAGES && (
                    <button
                      type='button'
                      disabled={isPosting}
                      onClick={() => fileRef.current?.click()}
                      className='flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-gray-400 transition-colors hover:border-gray-900 hover:text-gray-900'
                    >
                      <ImagePlus size={16} />
                      <span className='text-[10px]'>Add</span>
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type='file'
                    accept='image/*'
                    multiple
                    hidden
                    onChange={onPickImages}
                  />
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant='light' isDisabled={isPosting} onPress={close}>
                Cancel
              </Button>
              <Button
                className='bg-gray-900 text-white'
                isLoading={isPosting}
                isDisabled={!product || !rating}
                startContent={!isPosting ? <Check size={16} /> : null}
                onPress={() => submit(close)}
              >
                Post review
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
