'use client';

import { Input } from '@heroui/react';
import { useState } from 'react';

/**
 * Password field with a show/hide toggle.
 *
 * Drop-in replacement for the HeroUI <Input type='password' /> used on the auth
 * screens — every prop is forwarded, so callers keep their own name, id,
 * placeholder, validation and disabled state. `type` is applied after the
 * spread on purpose: it is this component's job, and a caller passing
 * type='password' must not pin the field shut.
 */
export default function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      className={className}
      type={visible ? 'text' : 'password'}
      endContent={
        <button
          // These fields live inside <form onSubmit>. Without an explicit
          // type, a <button> defaults to type='submit' — so revealing the
          // password would submit the login form instead.
          type='button'
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className='text-gray-400 hover:text-gray-700 focus:outline-none focus:text-gray-700'
        >
          <i
            className={`text-lg ${visible ? 'ri-eye-off-line' : 'ri-eye-line'}`}
            aria-hidden='true'
          />
        </button>
      }
    />
  );
}
