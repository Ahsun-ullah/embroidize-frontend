import {
  displayFormats,
  formatInches,
  formatMm,
  parseSizes,
} from '@/utils/parseProductDescription';
import { useMemo } from 'react';

const PencilIcon = () => (
  <svg
    width='20'
    height='20'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
    aria-hidden
  >
    <path d='M12 20h9' />
    <path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' />
  </svg>
);

/**
 * "Available formats" chips + "Available sizes" table, both read from the
 * product description (see utils/parseProductDescription). Formats fall back
 * to the real files on the product; the sizes card is hidden when the
 * description lists none. Two sibling cards so the page can order them
 * independently on mobile.
 */
export default function ProductSpecs({
  description,
  availableFileTypes,
  formatsClassName = '',
  sizesClassName = '',
}) {
  const formats = useMemo(
    () => displayFormats(description, availableFileTypes),
    [description, availableFileTypes],
  );
  const sizes = useMemo(() => parseSizes(description), [description]);
  const hasStitches = sizes.some((s) => s.stitches != null);

  return (
    <>
      {formats.length > 0 && (
        <section className={`${formatsClassName} p-4 sm:p-5`}>
          <h2 className='mb-3 flex items-center gap-2 text-lg font-bold text-[#1a1f4e]'>
            <PencilIcon />
            Available formats
          </h2>
          {/* Always one row: chips share the width evenly; a design with
              unusually many formats scrolls sideways instead of wrapping. */}
          <ul className='flex flex-nowrap gap-1 overflow-x-auto sm:gap-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {formats.map((f) => (
              <li
                key={f}
                className='min-w-[36px] flex-1 shrink-0 rounded-full border border-gray-200 bg-gray-50 px-1.5 py-1.5 text-center text-xs font-medium text-neutral-800 sm:text-[13px]'
              >
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {sizes.length > 0 && (
        <section className={`${sizesClassName} p-4 sm:p-5`}>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h2 className='flex items-center gap-2 text-lg font-bold text-[#1a1f4e]'>
              <PencilIcon />
              Available sizes
            </h2>
            <span className='text-sm text-neutral-600'>
              {sizes.length} {sizes.length === 1 ? 'Size' : 'Sizes'} included
            </span>
          </div>
          <div className='overflow-hidden rounded-xl border border-gray-200'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-gray-50 text-neutral-900'>
                <tr>
                  <th className='px-3 py-2 font-semibold'>Size (Inches)</th>
                  <th className='px-3 py-2 font-semibold'>Size (mm)</th>
                  {hasStitches && (
                    <th className='px-3 py-2 text-right font-semibold'>
                      Stitches
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='text-neutral-800'>
                {sizes.map((s) => (
                  <tr
                    key={`${s.widthIn}x${s.heightIn}`}
                    className='border-t border-gray-100'
                  >
                    <td className='whitespace-nowrap px-3 py-1.5'>
                      {formatInches(s.widthIn)} x {formatInches(s.heightIn)}
                    </td>
                    <td className='whitespace-nowrap px-3 py-1.5'>
                      {formatMm(s.widthMm)} x {formatMm(s.heightMm)} mm
                    </td>
                    {hasStitches && (
                      <td className='px-3 py-1.5 text-right tabular-nums'>
                        {s.stitches != null
                          ? s.stitches.toLocaleString('en-US')
                          : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
