'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import {
  Button,
  Chip,
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
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function getToken() {
  const row = document.cookie.split('; ').find((r) => r.startsWith('token='));
  return row ? row.split('=').slice(1).join('=') : undefined;
}

function apiBase() {
  return process.env.NEXT_PUBLIC_BASE_API_URL_PROD || process.env.NEXT_PUBLIC_BASE_API_URL;
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

  const { isOpen: isFormOpen, onOpen: onFormOpen, onOpenChange: onFormChange } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange } = useDisclosure();

  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [deletePlan, setDeletePlan] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }));

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
      downloadLimit: plan.downloadLimit != null ? String(plan.downloadLimit) : '',
      dailyLimit: plan.dailyLimit != null ? String(plan.dailyLimit) : '',
      features: (plan.features || []).join('\n'),
    });
    onFormOpen();
  };

  const savePlan = async () => {
    if (!form.name || !form.stripePriceId || form.price === '') {
      ErrorToast('Validation', 'Name, Stripe Price ID, and price are required.', 3000);
      return;
    }

    setIsSaving(true);
    try {
      const body = {
        name: form.name,
        type: form.type,
        billingInterval: form.type === 'recurring' ? form.billingInterval : null,
        stripePriceId: form.stripePriceId,
        price: parseFloat(form.price),
        downloadLimit: form.downloadLimit !== '' ? parseInt(form.downloadLimit, 10) : null,
        dailyLimit: form.dailyLimit !== '' ? parseInt(form.dailyLimit, 10) : null,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      const url = editingPlan
        ? `${apiBase()}/admin/subscription-plans/${editingPlan._id}`
        : `${apiBase()}/admin/subscription-plans`;
      const method = editingPlan ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save plan');

      SuccessToast('Success', editingPlan ? 'Plan updated.' : 'Plan created.', 3000);
      onFormChange(false);
      router.refresh();
      // Optimistic update
      if (editingPlan) {
        setPlans((prev) => prev.map((p) => (p._id === editingPlan._id ? result.data.plan : p)));
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
      const res = await fetch(`${apiBase()}/admin/subscription-plans/${plan._id}/toggle-active`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to toggle');
      setPlans((prev) => prev.map((p) => (p._id === plan._id ? result.data.plan : p)));
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
      const res = await fetch(`${apiBase()}/admin/subscription-plans/${deletePlan._id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
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
              {plan.type === 'one-time' ? 'One-time' : `Recurring · ${plan.billingInterval}ly`}
            </p>
            {plan.features?.length > 0 && (
              <p className='text-xs text-gray-400 mt-0.5'>{plan.features.length} feature{plan.features.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        );
      case 'price':
        return <span className='text-sm font-bold'>${plan.price}</span>;
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
            {plan.stripePriceId}
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
            <span className='text-xs'>{plan.isActive !== false ? 'Active' : 'Inactive'}</span>
          </Switch>
        );
      case 'actions':
        return (
          <div className='flex items-center gap-1'>
            <Button isIconOnly size='sm' variant='light' onPress={() => openEdit(plan)}>
              <Edit size={15} />
            </Button>
            <Button
              isIconOnly
              size='sm'
              variant='light'
              color='danger'
              onPress={() => { setDeletePlan(plan); onDeleteOpen(); }}
            >
              <Trash2 size={15} />
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Subscription Plans</h1>
          <p className='text-sm text-gray-500 mt-0.5'>{plans.length} plan{plans.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button color='primary' startContent={<Plus size={16} />} onPress={openCreate}>
          Add Plan
        </Button>
      </div>

      <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3'>
        <p className='text-xs text-amber-700 dark:text-amber-300'>
          <strong>Important:</strong> Create your price in the Stripe Dashboard first, then add it here using the Stripe Price ID.
          Changing the price shown here does <em>not</em> change the Stripe price — it only updates what&apos;s displayed to users.
        </p>
      </div>

      <Table aria-label='Subscription plans' removeWrapper>
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.uid}>{col.name}</TableColumn>}
        </TableHeader>
        <TableBody
          items={plans}
          emptyContent={
            <div className='py-12 text-center text-gray-400 text-sm'>No plans yet. Click &quot;Add Plan&quot; to create one.</div>
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
      <Modal isOpen={isFormOpen} onOpenChange={onFormChange} backdrop='blur' size='lg' scrollBehavior='inside'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</ModalHeader>
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
                        onChange={(e) => setField('billingInterval', e.target.value)}
                      >
                        <SelectItem key='week'>Weekly</SelectItem>
                        <SelectItem key='month'>Monthly</SelectItem>
                        <SelectItem key='year'>Yearly</SelectItem>
                      </Select>
                    )}
                  </div>

                  <Input
                    label='Stripe Price ID'
                    placeholder='price_...'
                    value={form.stripePriceId}
                    onChange={(e) => setField('stripePriceId', e.target.value)}
                    isRequired
                    isDisabled={!!editingPlan}
                    description={editingPlan ? 'Stripe Price ID cannot be changed after creation' : 'Find this in your Stripe Dashboard → Products'}
                  />

                  <Input
                    type='number'
                    label='Display Price (USD)'
                    placeholder='9.99'
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    isRequired
                    min='0'
                    step='0.01'
                    startContent={<span className='text-gray-400 text-sm'>$</span>}
                  />

                  <div className='grid grid-cols-2 gap-3'>
                    <Input
                      type='number'
                      label='Download Limit'
                      placeholder='Leave empty for unlimited'
                      value={form.downloadLimit}
                      onChange={(e) => setField('downloadLimit', e.target.value)}
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
                    placeholder={'Unlimited downloads\nHD quality\nPriority support'}
                    value={form.features}
                    onChange={(e) => setField('features', e.target.value)}
                    minRows={3}
                    description='Each line becomes a feature bullet point'
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>Cancel</Button>
                <Button color='primary' isLoading={isSaving} onPress={savePlan}>
                  {editingPlan ? 'Save Changes' : 'Create Plan'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} backdrop='blur' size='sm'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Delete Plan</ModalHeader>
              <ModalBody>
                <p className='text-sm'>
                  Are you sure you want to delete <strong>{deletePlan?.name}</strong>?
                  This can only be done if no active subscribers are on this plan.
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  If the plan has subscribers, deactivate it instead — the toggle will hide it from new sign-ups while keeping existing subscribers.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant='light' onPress={onClose}>Cancel</Button>
                <Button color='danger' isLoading={isDeleting} onPress={confirmDelete}>
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
