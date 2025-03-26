'use client';
import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className='flex items-center justify-between mb-8'>
        {!isCollapsed ? (
          <Link href={'/admin'} className='sidebar-text'>
            <Image
              style={{
                height: 'auto',
                width: '100%',
              }}
              src={'/twitter-bird-logo-pictures-0.png'}
              alt='logo'
              width={0}
              height={0}
            />
          </Link>
        ) : (
          <Tooltip content={'Logo'}>
            <Link href={'/admin'} className='sidebar-text me-2'>
              <Image
                style={{
                  height: 'auto',
                  width: 'auto',
                }}
                src={'/twitter-bird-logo-pictures-0.png'}
                alt='logo'
                width={20}
                height={50}
              />
            </Link>
          </Tooltip>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='collapse-btn'
        >
          {isCollapsed ? (
            <i className='ri-menu-unfold-fill'></i>
          ) : (
            <i className='ri-menu-fold-fill'></i>
          )}
        </button>
      </div>
      <ul>
        <li>
          <Link href='/admin'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-dashboard-fill me-2'></i>
                Dashboard
              </span>
            ) : (
              <Tooltip content={'Dashboard'}>
                <i className='ri-dashboard-fill '></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/users'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-dashboard-fill me-2'></i>
                Users
              </span>
            ) : (
              <Tooltip content={'Users'}>
                <i className='ri-group-fill '></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/categories'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-layout-grid-2-fill me-2'></i>
                Category & Sub-Category
              </span>
            ) : (
              <Tooltip content={'Categories'}>
                <i className='ri-layout-grid-2-fill me-2'></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/add-products'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-add-box-fill me-2'></i>
                Add Product
              </span>
            ) : (
              <Tooltip content={'Add Products'}>
                <i className='ri-add-box-fill'></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/all-products'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-list-check me-2'></i>
                All Product
              </span>
            ) : (
              <Tooltip content={' All Product'}>
                <i className='ri-list-check'></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/settings'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-settings-fill me-2'></i>
                Settings
              </span>
            ) : (
              <Tooltip content={'Settings'}>
                <i className='ri-settings-fill'></i>
              </Tooltip>
            )}
          </Link>
        </li>
      </ul>
    </div>
  );
}
