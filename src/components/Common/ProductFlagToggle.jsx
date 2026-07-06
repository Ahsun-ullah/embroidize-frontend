'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { useUpdateProductMutation } from '@/lib/redux/admin/protectedProducts/protectedProductSlice';
import { useState } from 'react';

/**
 * Click-to-toggle pill for a single boolean product flag (isFree / isActive)
 * straight from the admin products table. Reuses the existing product update
 * endpoint — the backend only touches a flag when it's sent, so a partial
 * FormData ({ id, <field> }) leaves everything else untouched.
 *
 * Optimistic: the pill flips immediately and reverts if the request fails.
 */
export default function ProductFlagToggle({
  productId,
  field, // 'isFree' | 'isActive'
  initialValue,
  onConfig, // { label, className } when the value is true
  offConfig, // { label, className } when the value is false
  messages, // { on, off } toast text
}) {
  const [value, setValue] = useState(!!initialValue);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();

  const handleClick = async () => {
    if (isLoading) return;
    const next = !value;
    setValue(next); // optimistic

    try {
      const fd = new FormData();
      fd.append('id', productId);
      fd.append(field, String(next));
      const res = await updateProduct(fd).unwrap();

      // Reconcile with the server's truth if it echoes the field back.
      const serverValue = res?.data?.[field];
      if (typeof serverValue === 'boolean') setValue(serverValue);

      SuccessToast('Updated', next ? messages.on : messages.off, 2000);
    } catch {
      setValue(!next); // revert
      ErrorToast('Error', 'Could not update. Please try again.', 3000);
    }
  };

  const cfg = value ? onConfig : offConfig;

  return (
    <div className='flex justify-center'>
      <button
        type='button'
        onClick={handleClick}
        disabled={isLoading}
        aria-pressed={value}
        title='Click to toggle'
        className={`inline-flex min-w-[74px] items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-60 ${cfg.className}`}
      >
        {isLoading ? (
          <span className='inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
        ) : (
          cfg.label
        )}
      </button>
    </div>
  );
}
