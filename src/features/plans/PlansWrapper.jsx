'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from '@heroui/react';
import { Edit, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

function authHeaders() {
  const token = getToken();
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

const EMPTY_FORM = {
  name: '',
  type: 'recurring',
  billingInterval: 'month',
  stripePriceId: '',
  price: '',
  downloadLimit: '',
  dailyLimit: '',
  features: '',
};

export default function PlansWrapper({ plans: initialPlans }) {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onOpenChange: onFormChange,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteChange,
  } = useDisclosure();

  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletePlan, setDeletePlan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Stripe price picker ("Sync from Stripe")
  const [stripePrices, setStripePrices] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [pricesError, setPricesError] = useState('');
  const [manualPriceId, setManualPriceId] = useState(false);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const fetchStripePrices = async () => {
    setLoadingPrices(true);
    setPricesError('');
    try {
      const res = await fetch(
        `${apiBase()}/admin/subscription-plans/stripe-prices`,
        { headers: authHeaders() },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to load prices');
      setStripePrices(result.data?.prices || []);
    } catch (err) {
      setPricesError(err.message || 'Failed to load prices');
      setManualPriceId(true); // fall back to manual entry
    } finally {
      setLoadingPrices(false);
    }
  };

  // Load prices from Stripe whenever the create/edit modal opens.
  useEffect(() => {
    if (isFormOpen) {
      setManualPriceId(false);
      fetchStripePrices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormOpen]);

  // Selecting a Stripe price auto-fills price, interval, type (and name if empty).
  const applyStripePrice = (priceId) => {
    const price = stripePrices.find((p) => p.id === priceId);
    if (!price) {
      setField('stripePriceId', priceId);
      return;
    }
    setForm((f) => ({
      ...f,
      stripePriceId: price.id,
      price: price.amount != null ? String(price.amount) : f.price,
      type: price.type || f.type,
      billingInterval: ['week', 'month', 'year'].includes(price.interval)
        ? price.interval
        : f.billingInterval,
      name: f.name?.trim() ? f.name : price.productName || '',
    }));
  };

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    onFormOpen();
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || '',
      type: plan.type || 'recurring',
      billingInterval: plan.billingInterval || 'month',
      stripePriceId: plan.stripePriceId || '',
      price: String(plan.price ?? ''),
      savePercent: plan.savePercent != null ? String(plan.savePercent) : '',
      downloadLimit:
        plan.downloadLimit != null ? String(plan.downloadLimit) : '',
      dailyLimit: plan.dailyLimit != null ? String(plan.dailyLimit) : '',
      features: (plan.features || []).join('\n'),
    });
    onFormOpen();
  };

  const savePlan = async () => {
    if (!form.name || form.price === '') {
      ErrorToast('Validation', 'Name and price are required.', 3000);
      return;
    }
    if (!form.stripePriceId) {
      ErrorToast('Validation', 'Stripe Price ID is required.', 3000);
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        name: form.name,
        type: form.type,
        billingInterval:
          form.type === 'recurring' ? form.billingInterval : null,
        stripePriceId: form.stripePriceId || undefined,
        price: parseFloat(form.price),
        savePercent:
          form.savePercent !== '' ? parseFloat(form.savePercent) : null,
        downloadLimit:
          form.downloadLimit !== '' ? parseInt(form.downloadLimit, 10) : null,
        dailyLimit:
          form.dailyLimit !== '' ? parseInt(form.dailyLimit, 10) : null,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      const url = editingPlan
        ? `${apiBase()}/admin/subscription-plans/${editingPlan._id}`
        : `${apiBase()}/admin/subscription-plans`;
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save plan');

      SuccessToast(
        'Success',
        editingPlan ? 'Plan updated.' : 'Plan created.',
        3000,
      );
      onFormChange(false);
      router.refresh();
      // Optimistic update
      if (editingPlan) {
        setPlans((prev) =>
          prev.map((p) => (p._id === editingPlan._id ? result.data.plan : p)),
        );
      } else {
        setPlans((prev) => [...prev, result.data.plan]);
      }
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to save plan', 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (plan) => {
    setTogglingId(plan._id);
    try {
      const res = await fetch(
        `${apiBase()}/admin/subscription-plans/${plan._id}/toggle-active`,
        {
          method: 'PATCH',
          headers: authHeaders(),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to toggle');
      setPlans((prev) =>
        prev.map((p) => (p._id === plan._id ? result.data.plan : p)),
      );
      SuccessToast('Success', result.message, 3000);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to toggle plan', 3000);
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletePlan) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/subscription-plans/${deletePlan._id}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        },
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to delete');
      setPlans((prev) => prev.filter((p) => p._id !== deletePlan._id));
      SuccessToast('Success', 'Plan deleted.', 3000);
      onDeleteChange(false);
    } catch (err) {
      ErrorToast('Error', err.message || 'Failed to delete plan', 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { uid: 'name', name: 'PLAN' },
    { uid: 'price', name: 'PRICE' },
    { uid: 'savePercent', name: 'SAVE %' },
    { uid: 'limits', name: 'LIMITS' },
    { uid: 'stripe', name: 'STRIPE PRICE ID' },
    { uid: 'status', name: 'STATUS' },
    { uid: 'actions', name: 'ACTIONS' },
  ];

  const renderCell = (plan, key) => {
    switch (key) {
      case 'name':
        return (
          <div>
            <p className='text-sm font-semibold'>{plan.name}</p>
            <p className='text-xs text-gray-500 capitalize'>
              {plan.type === 'one-time'
                ? 'One-time'
                : `Recurring · ${plan.billingInterval}ly`}
            </p>
            {plan.features?.length > 0 && (
              <p className='text-xs text-gray-400 mt-0.5'>
                {plan.features.length} feature
                {plan.features.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        );
      case 'price':
        return <span className='text-sm font-bold'>${plan.price}</span>;
      case 'savePercent':
        return <span className='text-sm font-bold'>{plan.savePercent}%</span>;
      case 'limits':
        return (
          <div className='text-xs text-gray-600'>
            <p>Downloads: {plan.downloadLimit ?? '∞'}</p>
            <p>Daily: {plan.dailyLimit ?? '∞'}</p>
          </div>
        );
      case 'stripe':
        return (
          <span className='text-xs font-mono text-gray-500 break-all max-w-[160px] block'>
            {plan.stripePriceId || (
              <span className='italic text-gray-300'>—</span>
            )}
          </span>
        );
      case 'status':
        return (
          <Switch
            isSelected={plan.isActive !== false}
            isDisabled={togglingId === plan._id}
            onValueChange={() => toggleActive(plan)}
            size='sm'
            color='success'
          >
            <span className='text-xs'>
              {plan.isActive !== false ? 'Active' : 'Inactive'}
            </span>
          </Switch>
        );
      case 'actions':
        return (
          <div className='flex items-center gap-1'>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              onPress={() => openEdit(plan)}
            >
              <Edit size={15} />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              color='danger'
              onPress={() => {
                setDeletePlan(plan);
                onDeleteOpen();
              }}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Include the plan's current price ID as an option even if it isn't in the
  // active Stripe list (e.g. archived price), so editing never loses it.
  const priceOptions = (() => {
    const list = [...stripePrices];
    if (form.stripePriceId && !list.some((p) => p.id === form.stripePriceId)) {
      list.unshift({
        id: form.stripePriceId,
        productName: 'Current price',
        amount: null,
        interval: null,
        __current: true,
      });
    }
    return list;
  })();

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Subscription Plans</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            {plans.length} plan{plans.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          color='primary'
          startContent={<Plus size={16} />}
          onPress={openCreate}
        >
          Add Plan
        </Button>
      </div>

      <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3'>
        <p className='text-xs text-amber-700 dark:text-amber-300'>
          <strong>Important:</strong> Create your price in Stripe first, then
          paste the Price ID here. A plan must have a Stripe Price ID. Changing
          the display price does <em>not</em> change the Stripe price.
          <br />
          <strong>Going live?</strong> Edit each plan and replace its test{' '}
          <code className='font-mono'>price_…</code> with the matching{' '}
          <strong>live</strong> Price ID.
        </p>
      </div>

      <Table aria-label='Subscription plans' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={plans}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>
              No plans yet. Click &quot;Add Plan&quot; to create one.
            </div>
          }
        >
          {(plan) => (
            <TableRow key={plan._id}>
              {(colKey) => <TableCell>{renderCell(plan, colKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={isFormOpen}
        onOpenChange={onFormChange}
        backdrop='blur'
        size='lg'
        scrollBehavior='inside'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  <Input
                    label='Plan Name'
                    placeholder='e.g. Pro Monthly'
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    isRequired
                  />

                  <div className='grid grid-cols-2 gap-3'>
                    <Select
                      label='Type'
                      selectedKeys={[form.type]}
                      onChange={(e) => setField('type', e.target.value)}
                    >
                      <SelectItem key='recurring'>Recurring</SelectItem>
                      <SelectItem key='one-time'>One-time</SelectItem>
                    </Select>

                    {form.type === 'recurring' && (
                      <Select
                        label='Billing Interval'
                        selectedKeys={[form.billingInterval]}
                        onChange={(e) =>
                          setField('billingInterval', e.target.value)
                        }
                      >
                        <SelectItem key='week'>Weekly</SelectItem>
                        <SelectItem key='month'>Monthly</SelectItem>
                        <SelectItem key='year'>Yearly</SelectItem>
                      </Select>
                    )}
                  </div>

                  {/* Stripe price picker — synced live from Stripe */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Stripe Price</span>
                      <div className='flex items-center gap-3'>
                        <button
                          type='button'
                          onClick={fetchStripePrices}
                          disabled={loadingPrices}
                          className='inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50'
                        >
                          <RefreshCw
                            size={12}
                            className={loadingPrices ? 'animate-spin' : ''}
                          />
                          Sync
                        </button>
                        <button
                          type='button'
                          onClick={() => setManualPriceId((v) => !v)}
                          className='text-xs text-gray-500 hover:text-gray-900 underline'
                        >
                          {manualPriceId ? 'Pick from Stripe' : 'Enter ID manually'}
                        </button>
                      </div>
                    </div>

                    {!manualPriceId ? (
                      <Select
                        aria-label='Stripe Price'
                        placeholder={
                          loadingPrices ? 'Loading prices…' : 'Select a Stripe price'
                        }
                        isLoading={loadingPrices}
                        selectedKeys={
                          form.stripePriceId ? [form.stripePriceId] : []
                        }
                        onChange={(e) => applyStripePrice(e.target.value)}
                        isRequired
                      >
                        {priceOptions.map((p) => (
                          <SelectItem
                            key={p.id}
                            textValue={`${p.productName} ${p.id}`}
                          >
                            <div className='flex flex-col'>
                              <span className='text-sm'>
                                {p.productName}
                                {p.amount != null ? ` — $${p.amount}` : ''}
                                {p.interval ? ` / ${p.interval}` : ''}
                                {p.__current ? ' (current)' : ''}
                              </span>
                              <span className='text-[11px] font-mono text-gray-400'>
                                {p.id}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        aria-label='Stripe Price ID'
                        placeholder='price_...'
                        value={form.stripePriceId}
                        onChange={(e) => setField('stripePriceId', e.target.value)}
                        isRequired
                      />
                    )}

                    {pricesError ? (
                      <p className='text-xs text-red-500'>
                        {pricesError} — enter the ID manually.
                      </p>
                    ) : (
                      <p className='text-xs text-gray-400'>
                        Prices are pulled live from Stripe. Selecting one auto-fills
                        price, interval and type.
                      </p>
                    )}
                  </div>

                  <Input
                    type='number'
                    label='Display Price (USD)'
                    placeholder='9.99'
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    isRequired
                    min='0'
                    step='0.01'
                    startContent={
                      <span className='text-gray-400 text-sm'>$</span>
                    }
                  />

                  <Input
                    type='number'
                    label='Save Percent (Optional)'
                    placeholder='Leave empty for default'
                    value={form.savePercent}
                    onChange={(e) => setField('savePercent', e.target.value)}
                    min='0'
                    max='100'
                    step='0.1'
                  />

                  <div className='grid grid-cols-2 gap-3'>
                    <Input
                      type='number'
                      label='Download Limit'
                      placeholder='Leave empty for unlimited'
                      value={form.downloadLimit}
                      onChange={(e) =>
                        setField('downloadLimit', e.target.value)
                      }
                      min='0'
                      description='Per billing period'
                    />
                    <Input
                      type='number'
                      label='Daily Limit'
                      placeholder='Leave empty for unlimited'
                      value={form.dailyLimit}
                      onChange={(e) => setField('dailyLimit', e.target.value)}
                      min='0'
                      description='Per day'
                    />
                  </div>

                  <Textarea
                    label='Features (one per line)'
                    placeholder={
                      'Unlimited downloads\nHD quality\nPriority support'
                    }
                    value={form.features}
                    onChange={(e) => setField('features', e.target.value)}
                    minRows={3}
                    description='Each line becomes a feature bullet point'
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button color='primary' isLoading={isSaving} onPress={savePlan}>
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteChange}
        backdrop='blur'
        size='sm'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Plan</ModalHeader>
              <ModalBody>
                <p className='text-sm'>
                  Are you sure you want to delete{' '}
                  <strong>{deletePlan?.name}</strong>? This can only be done if
                  no active subscribers are on this plan.
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  If the plan has subscribers, deactivate it instead — the
                  toggle will hide it from new sign-ups while keeping existing
                  subscribers.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  isLoading={isDeleting}
                  onPress={confirmDelete}
                >
                  Delete Plan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
