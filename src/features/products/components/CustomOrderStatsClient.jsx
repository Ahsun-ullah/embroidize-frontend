'use client';

import { Card, CardBody } from '@heroui/react';
import { CheckCircle, Clock, FileText, Loader, XCircle } from 'lucide-react';

export function CustomOrderStatsClient({ stats }) {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: FileText,
      accent: 'border-blue-500 text-blue-600',
      dot: 'bg-blue-500',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      accent: 'border-amber-500 text-amber-600',
      dot: 'bg-amber-500',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Loader,
      accent: 'border-purple-500 text-purple-600',
      dot: 'bg-purple-500',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      accent: 'border-emerald-500 text-emerald-600',
      dot: 'bg-emerald-500',
    },
    {
      title: 'Cancelled',
      value: stats.cancelled,
      icon: XCircle,
      accent: 'border-rose-500 text-rose-600',
      dot: 'bg-rose-500',
    },
  ];

  const distributionItems = [
    { label: 'Pending', value: stats.pending, color: 'bg-amber-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-purple-500' },
    { label: 'Completed', value: stats.completed, color: 'bg-emerald-500' },
    { label: 'Cancelled', value: stats.cancelled, color: 'bg-rose-500' },
  ];

  return (
    <div className='space-y-4'>
      {/* Compact stats row */}
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className={`border border-transparent hover:${stat.accent.split(' ')[0]} transition-colors`}
            >
              <CardBody className='p-3 sm:p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900'>
                    <Icon className={`h-5 w-5 ${stat.accent.split(' ')[1]}`} />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-xs font-medium text-slate-500'>
                      {stat.title}
                    </span>
                    <span className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                      {stat.value}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Very simple distribution bar */}
      {stats.total > 0 && (
        <Card className='border border-slate-200 dark:border-slate-800'>
          <CardBody className='p-4 space-y-3'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-sm font-semibold text-slate-800 dark:text-slate-100'>
                Status distribution
              </span>
              <span className='text-xs text-slate-500'>
                {stats.total} orders
              </span>
            </div>

            {/* Single stacked bar */}
            <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 flex overflow-hidden'>
              {distributionItems.map((item) => {
                if (!item.value || stats.total === 0) return null;
                const width = (item.value / stats.total) * 100;
                return (
                  <div
                    key={item.label}
                    className={`${item.color} h-2`}
                    style={{ width: `${width}%` }}
                  />
                );
              })}
            </div>

            {/* Tiny legend */}
            <div className='flex flex-wrap gap-3'>
              {distributionItems.map((item) => {
                if (!stats.total) return null;
                const percentage = ((item.value / stats.total) * 100).toFixed(
                  1,
                );
                return (
                  <div
                    key={item.label}
                    className='flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300'
                  >
                    <span className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span className='font-medium'>{item.label}</span>
                    <span className='text-slate-400'>
                      ({item.value} · {percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
