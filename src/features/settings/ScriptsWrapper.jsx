'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Chip,
  Input,
  Pagination,
  Select,
  SelectItem,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
} from '@heroui/react';
import { Eye, EyeOff, KeyRound, Mail, Search, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD || process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

const ACTION_LABEL = {
  create_user: 'Create User',
  reset_password: 'Reset Password',
  test_email: 'Test Email',
};

const ACTION_COLOR = {
  create_user: 'success',
  reset_password: 'warning',
  test_email: 'primary',
};

const TEMPLATE_LABEL = {
  welcome: 'Welcome',
  forgot: 'Forgot password (link)',
  created: 'Admin: account created',
  reset: 'Admin: password reset',
};

export default function ScriptsWrapper({ initialAuditLog }) {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Admin Scripts</h1>
        <p className='text-sm text-gray-500 mt-0.5'>
          Run privileged user-management actions from the dashboard. Every run is recorded
          in the audit log.
        </p>
      </div>

      <Tabs aria-label='Admin scripts' variant='underlined' color='primary'>
        <Tab
          key='create-user'
          title={
            <div className='flex items-center gap-2'>
              <UserPlus size={16} />
              <span>Create User</span>
            </div>
          }
        >
          <CreateUserPanel />
        </Tab>
        <Tab
          key='reset-password'
          title={
            <div className='flex items-center gap-2'>
              <KeyRound size={16} />
              <span>Reset Password</span>
            </div>
          }
        >
          <ResetPasswordPanel />
        </Tab>
        <Tab
          key='test-email'
          title={
            <div className='flex items-center gap-2'>
              <Mail size={16} />
              <span>Test Email</span>
            </div>
          }
        >
          <TestEmailPanel />
        </Tab>
        <Tab
          key='audit'
          title={
            <div className='flex items-center gap-2'>
              <ShieldCheck size={16} />
              <span>Audit Log</span>
            </div>
          }
        >
          <AuditLogPanel initial={initialAuditLog} />
        </Tab>
      </Tabs>
    </div>
  );
}

/* ───────────── Create User ───────────── */

function CreateUserPanel() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'user',
    sendEmail: true,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      ErrorToast('Validation', 'Please enter a valid email.', 3000);
      return;
    }
    if (!form.password || form.password.length < 6) {
      ErrorToast('Validation', 'Password must be at least 6 characters.', 3000);
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`${apiBase()}/admin/scripts/create-user`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          name: form.name.trim() || undefined,
          password: form.password,
          role: form.role,
          sendEmail: form.sendEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create user');
      SuccessToast('Success', json.message, 3000);
      setResult(json.data);
      setForm({ email: '', name: '', password: '', role: 'user', sendEmail: true });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to create user', 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='py-4 max-w-xl space-y-4'>
      <Input
        label='Email'
        type='email'
        placeholder='user@example.com'
        value={form.email}
        onChange={(e) => setField('email', e.target.value)}
        isRequired
      />
      <Input
        label='Name (optional)'
        placeholder='Full name'
        value={form.name}
        onChange={(e) => setField('name', e.target.value)}
      />
      <Input
        label='Temporary password'
        type={showPwd ? 'text' : 'password'}
        placeholder='At least 6 characters'
        value={form.password}
        onChange={(e) => setField('password', e.target.value)}
        isRequired
        endContent={
          <button
            type='button'
            onClick={() => setShowPwd((s) => !s)}
            className='text-gray-500'
            aria-label='toggle password visibility'
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <Select
        label='Role'
        selectedKeys={[form.role]}
        onChange={(e) => setField('role', e.target.value)}
      >
        <SelectItem key='user' value='user'>
          Regular User
        </SelectItem>
        <SelectItem key='admin' value='admin'>
          Admin
        </SelectItem>
      </Select>
      <div className='flex items-center justify-between border rounded-lg p-3'>
        <div>
          <p className='text-sm font-medium'>Email credentials to user</p>
          <p className='text-xs text-gray-500'>
            Sends the temporary password using the admin-created-account template.
          </p>
        </div>
        <Switch isSelected={form.sendEmail} onValueChange={(v) => setField('sendEmail', v)} />
      </div>

      <Button color='primary' isLoading={busy} onPress={submit}>
        Create {form.role === 'admin' ? 'Admin' : 'User'}
      </Button>

      {result && (
        <div className='mt-2 rounded-lg border bg-green-50 dark:bg-green-900/20 p-3 text-xs space-y-1'>
          <p>
            <strong>Created:</strong> {result.email} ({result.role})
          </p>
          {result.emailSent ? (
            <p className='text-green-700 dark:text-green-300'>
              Credentials emailed to the user.
            </p>
          ) : (
            <p className='text-amber-700 dark:text-amber-300'>
              Email NOT sent — share the password manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────── Reset Password ───────────── */

function ResetPasswordPanel() {
  const [form, setForm] = useState({ email: '', newPassword: '', sendEmail: true });
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      ErrorToast('Validation', 'Please enter a valid email.', 3000);
      return;
    }
    if (!form.newPassword || form.newPassword.length < 6) {
      ErrorToast('Validation', 'Password must be at least 6 characters.', 3000);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${apiBase()}/admin/scripts/reset-password`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          newPassword: form.newPassword,
          sendEmail: form.sendEmail,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to reset password');
      SuccessToast('Success', json.message, 3000);
      setForm({ email: '', newPassword: '', sendEmail: true });
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to reset password', 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='py-4 max-w-xl space-y-4'>
      <Input
        label='User email'
        type='email'
        placeholder='user@example.com'
        value={form.email}
        onChange={(e) => setField('email', e.target.value)}
        isRequired
      />
      <Input
        label='New password'
        type={showPwd ? 'text' : 'password'}
        placeholder='At least 6 characters'
        value={form.newPassword}
        onChange={(e) => setField('newPassword', e.target.value)}
        isRequired
        endContent={
          <button
            type='button'
            onClick={() => setShowPwd((s) => !s)}
            className='text-gray-500'
            aria-label='toggle password visibility'
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      <div className='flex items-center justify-between border rounded-lg p-3'>
        <div>
          <p className='text-sm font-medium'>Email new password to user</p>
          <p className='text-xs text-gray-500'>
            Sends the new credentials using the admin-password-reset template.
          </p>
        </div>
        <Switch isSelected={form.sendEmail} onValueChange={(v) => setField('sendEmail', v)} />
      </div>

      <div className='rounded-lg border bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-300'>
        Encourage the user to change this password after first sign-in.
      </div>

      <Button color='warning' isLoading={busy} onPress={submit}>
        Reset Password
      </Button>
    </div>
  );
}

/* ───────────── Test Email ───────────── */

function TestEmailPanel() {
  const [form, setForm] = useState({ to: '', template: 'welcome' });
  const [busy, setBusy] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.to.trim() || !/^\S+@\S+\.\S+$/.test(form.to.trim())) {
      ErrorToast('Validation', 'Please enter a valid recipient email.', 3000);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${apiBase()}/admin/scripts/test-email`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          to: form.to.trim().toLowerCase(),
          template: form.template,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send test email');
      SuccessToast('Sent', json.message, 3000);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to send test email', 3000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='py-4 max-w-xl space-y-4'>
      <Input
        label='Recipient email'
        type='email'
        placeholder='your@email.com'
        value={form.to}
        onChange={(e) => setField('to', e.target.value)}
        isRequired
      />
      <Select
        label='Template'
        selectedKeys={[form.template]}
        onChange={(e) => setField('template', e.target.value)}
      >
        {Object.entries(TEMPLATE_LABEL).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </Select>
      <p className='text-xs text-gray-500'>
        Sends a sample of the chosen template via ZeptoMail. Useful for verifying SMTP /
        DNS / template rendering after deploys.
      </p>
      <Button color='primary' isLoading={busy} onPress={submit}>
        Send Test Email
      </Button>
    </div>
  );
}

/* ───────────── Audit Log ───────────── */

function AuditLogPanel({ initial }) {
  const [data, setData] = useState(
    initial || { items: [], page: 1, limit: 20, total: 0, totalPages: 1 }
  );
  const [filters, setFilters] = useState({ action: '', search: '', page: 1 });
  const [loading, setLoading] = useState(false);

  const load = async (next) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (next.action) params.set('action', next.action);
      if (next.search) params.set('search', next.search);
      params.set('page', String(next.page));
      params.set('limit', '20');
      const res = await fetch(`${apiBase()}/admin/scripts/audit-log?${params.toString()}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load audit log');
      setData(json.data);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to load audit log', 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(filters), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.action, filters.search, filters.page]);

  const setFilter = (k, v) =>
    setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));

  const columns = useMemo(
    () => [
      { uid: 'createdAt', name: 'WHEN' },
      { uid: 'action', name: 'ACTION' },
      { uid: 'admin', name: 'ADMIN' },
      { uid: 'target', name: 'TARGET' },
      { uid: 'metadata', name: 'DETAILS' },
    ],
    []
  );

  const renderCell = (item, key) => {
    switch (key) {
      case 'createdAt':
        return <span className='text-xs text-gray-500'>{formatDate(item.createdAt)}</span>;
      case 'action':
        return (
          <Chip
            size='sm'
            color={ACTION_COLOR[item.action] || 'default'}
            variant='flat'
          >
            {ACTION_LABEL[item.action] || item.action}
          </Chip>
        );
      case 'admin':
        return (
          <div className='text-xs'>
            <p className='font-medium'>{item.adminId?.name || 'Admin'}</p>
            {item.adminId?.email && (
              <p className='text-gray-500 dark:text-gray-400'>{item.adminId.email}</p>
            )}
          </div>
        );
      case 'target':
        return (
          <div className='text-xs'>
            <p className='font-medium break-all'>{item.targetEmail || '—'}</p>
            {item.targetUserId?.name && (
              <p className='text-gray-500 dark:text-gray-400'>{item.targetUserId.name}</p>
            )}
          </div>
        );
      case 'metadata':
        return <MetaCell item={item} />;
      default:
        return null;
    }
  };

  return (
    <div className='py-4 space-y-4'>
      <div className='flex flex-col md:flex-row gap-3'>
        <Input
          placeholder='Search target email…'
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          startContent={<Search size={14} className='text-gray-400' />}
          className='md:max-w-xs'
        />
        <Select
          placeholder='All actions'
          selectedKeys={filters.action ? [filters.action] : []}
          onChange={(e) => setFilter('action', e.target.value)}
          className='md:max-w-xs'
        >
          <SelectItem key='' value=''>
            All actions
          </SelectItem>
          <SelectItem key='create_user' value='create_user'>
            Create User
          </SelectItem>
          <SelectItem key='reset_password' value='reset_password'>
            Reset Password
          </SelectItem>
          <SelectItem key='test_email' value='test_email'>
            Test Email
          </SelectItem>
        </Select>
        <div className='flex-1' />
        <div className='text-xs text-gray-500 self-center'>
          {data.total} entr{data.total === 1 ? 'y' : 'ies'}
        </div>
      </div>

      <Table aria-label='Admin action audit log' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={data.items || []}
          isLoading={loading}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>
              No audit entries match these filters.
            </div>
          }
        >
          {(item) => (
            <TableRow key={item._id}>
              {(colKey) => <TableCell>{renderCell(item, colKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {data.totalPages > 1 && (
        <div className='flex justify-center pt-2'>
          <Pagination
            showControls
            showShadow
            color='primary'
            page={data.page}
            total={data.totalPages}
            onChange={(p) => setFilter('page', p)}
          />
        </div>
      )}
    </div>
  );
}

function MetaCell({ item }) {
  const m = item.metadata || {};
  if (item.action === 'create_user') {
    return (
      <div className='text-xs space-y-0.5'>
        <p>
          Role: <strong>{m.role || 'user'}</strong>
        </p>
        <p className='text-gray-500'>{m.sendEmail ? 'Emailed user' : 'No email sent'}</p>
      </div>
    );
  }
  if (item.action === 'reset_password') {
    return (
      <p className='text-xs text-gray-500'>
        {m.sendEmail ? 'Emailed user' : 'No email sent'}
      </p>
    );
  }
  if (item.action === 'test_email') {
    return (
      <p className='text-xs'>
        Template: <strong>{TEMPLATE_LABEL[m.template] || m.template || '—'}</strong>
      </p>
    );
  }
  return <span className='text-xs text-gray-400'>—</span>;
}
