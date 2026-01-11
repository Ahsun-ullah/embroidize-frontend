'use client';
import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  return (
    <div className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className='flex items-center justify-between mb-8'>
        {!isCollapsed ? (
          <Link href='/admin' className='sidebar-text'>
            <div style={{ display: 'block', width: '100%', height: 'auto' }}>
              <Image src='/logo-white.png' alt='logo' width={100} height={50} />
            </div>
          </Link>
        ) : (
          <Tooltip content={'Logo'}>
            <Link href={'/admin'} className='sidebar-text me-2'>
              <Image
                style={{
                  height: 'auto',
                  width: '100%',
                }}
                src={'/favicon-white.png'}
                alt='logo'
                width={150}
                height={150}
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
          <Link href='/admin/downloads'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-download-cloud-fill me-2'></i>
                Downloaded Products
              </span>
            ) : (
              <Tooltip content={'Downloads'}>
                <i className='ri-download-cloud-fill'></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/bundle-products'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-file-list-3-fill me-2'></i>
                All Bundles
              </span>
            ) : (
              <Tooltip content={'All Bundles'}>
                <i className='ri-file-list-3-fill'></i>
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
          <Link href='/admin/all-blogs'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-news-line me-2'></i>
                Blogs And Resources
              </span>
            ) : (
              <Tooltip content={' All Blogs'}>
                <i className='ri-news-line'></i>
              </Tooltip>
            )}
          </Link>
        </li>
        <li>
          <Link href='/admin/contact-submissions'>
            {!isCollapsed ? (
              <span className='sidebar-text '>
                <i className='ri-mail-line me-2'></i>
                Contact Submissions
              </span>
            ) : (
              <Tooltip content={'Contact Submissions'}>
                <i className='ri-mail-line'></i>
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
