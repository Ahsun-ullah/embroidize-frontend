'use client';

import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const pathname = usePathname();

  const NavItem = ({ href, icon, label, tooltip }) => {
    const isActive = pathname === href;

    if (isCollapsed) {
      return (
        <li>
          <Link href={href}>
            <Tooltip content={tooltip}>
              <div
                className={`
                  flex items-center justify-center
                  rounded-md p-2 text-xl
                  ${isActive ? 'bg-slate-800 text-white' : 'text-slate-100'}
                  hover:bg-slate-800 hover:text-white
                  transition-colors duration-150
                `}
              >
                <i className={icon}></i>
              </div>
            </Tooltip>
          </Link>
        </li>
      );
    }

    return (
      <li>
        <Link href={href}>
          <div
            className={`
              flex items-center gap-2
              rounded-md px-3 py-2
              text-sm font-medium
              ${isActive ? 'bg-slate-800 text-white' : 'text-slate-100'}
              hover:bg-slate-800 hover:text-white
              transition-colors duration-150
            `}
          >
            <i className={`${icon} text-base`}></i>
            <span>{label}</span>
          </div>
        </Link>
      </li>
    );
  };

  return (
    <aside
      className={`
        fixed
        top-0
        left-0
        z-30
        h-screen
        bg-slate-900
        text-white
        transition-all duration-200
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo + Collapse Button */}
      <div className='flex items-center justify-between mb-6 px-4 pt-4'>
        {!isCollapsed ? (
          <Link href='/admin' className='sidebar-text'>
            <div style={{ display: 'block', width: '100%', height: 'auto' }}>
              <Image src='/logo-white.png' alt='logo' width={100} height={50} />
            </div>
          </Link>
        ) : (
          <Tooltip content='Logo'>
            <Link href='/admin' className='sidebar-text me-2'>
              <Image
                style={{ height: 'auto', width: '100%' }}
                src='/favicon-white.png'
                alt='logo'
                width={150}
                height={150}
              />
            </Link>
          </Tooltip>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='collapse-btn text-xl text-slate-100 hover:text-white'
        >
          {isCollapsed ? (
            <i className='ri-menu-unfold-fill'></i>
          ) : (
            <i className='ri-menu-fold-fill'></i>
          )}
        </button>
      </div>

      {/* Navigation */}
      <ul className='space-y-1 px-3 pb-4 overflow-y-auto'>
        <NavItem
          href='/admin'
          icon='ri-dashboard-fill'
          label='Dashboard'
          tooltip='Dashboard'
        />

        <NavItem
          href='/admin/downloads'
          icon='ri-download-cloud-fill'
          label='Downloaded Products'
          tooltip='Downloads'
        />

        <NavItem
          href='/admin/custom-orders'
          icon='ri-file-list-3-fill'
          label='Custom Orders'
          tooltip='Custom Orders'
        />

        <NavItem
          href='/admin/bundle-products'
          icon='ri-file-list-3-fill'
          label='All Bundles'
          tooltip='All Bundles'
        />

        <NavItem
          href='/admin/users'
          icon='ri-group-fill'
          label='Users'
          tooltip='Users'
        />

        <NavItem
          href='/admin/categories'
          icon='ri-layout-grid-2-fill'
          label='Category & Sub-Category'
          tooltip='Categories'
        />

        <NavItem
          href='/admin/add-products'
          icon='ri-add-box-fill'
          label='Add Product'
          tooltip='Add Products'
        />

        <NavItem
          href='/admin/all-products'
          icon='ri-list-check'
          label='All Product'
          tooltip='All Product'
        />

        <NavItem
          href='/admin/all-blogs'
          icon='ri-news-line'
          label='Blogs And Resources'
          tooltip='Blogs'
        />

        <NavItem
          href='/admin/contact-submissions'
          icon='ri-mail-line'
          label='Contact Submissions'
          tooltip='Contact Submissions'
        />

        <NavItem
          href='/admin/settings'
          icon='ri-settings-fill'
          label='Settings'
          tooltip='Settings'
        />
      </ul>
    </aside>
  );
}
