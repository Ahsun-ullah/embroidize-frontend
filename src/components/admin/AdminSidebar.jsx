'use client';

import { Tooltip } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  // Nested group: parent label expands to show child links.
  // When sidebar is collapsed, clicking the icon navigates to the first child
  // (full nested behavior shows when sidebar is expanded).
  const NavGroup = ({ icon, label, tooltip, items }) => {
    const isAnyChildActive = items.some(
      (it) => pathname === it.href || pathname.startsWith(`${it.href}/`)
    );
    const [open, setOpen] = useState(isAnyChildActive);

    useEffect(() => {
      if (isAnyChildActive) setOpen(true);
    }, [isAnyChildActive]);

    if (isCollapsed) {
      return (
        <NavItem
          href={items[0].href}
          icon={icon}
          label={label}
          tooltip={tooltip}
        />
      );
    }

    return (
      <li>
        <button
          type='button'
          onClick={() => setOpen((v) => !v)}
          className={`
            w-full flex items-center gap-2
            rounded-md px-3 py-2
            text-sm font-medium
            ${isAnyChildActive ? 'text-white' : 'text-slate-100'}
            hover:bg-slate-800 hover:text-white
            transition-colors duration-150
          `}
          aria-expanded={open}
        >
          <i className={`${icon} text-base`}></i>
          <span className='flex-1 text-left'>{label}</span>
          <i
            className={`text-base transition-transform ${open ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}`}
          ></i>
        </button>

        {open && (
          <ul className='mt-1 ml-3 pl-3 border-l border-slate-700 space-y-1'>
            {items.map((it) => {
              const childActive = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link href={it.href}>
                    <div
                      className={`
                        flex items-center gap-2
                        rounded-md px-3 py-2
                        text-sm
                        ${childActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-300'}
                        hover:bg-slate-800 hover:text-white
                        transition-colors duration-150
                      `}
                    >
                      {it.icon && <i className={`${it.icon} text-sm`}></i>}
                      <span>{it.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
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
        flex flex-col
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo + Collapse Button */}
      <div className='flex items-center justify-between mb-6 px-4 pt-4 shrink-0'>
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
      <ul className='space-y-1 px-3 pb-10 flex-1 min-h-0 overflow-y-auto sidebar-scroll'>
        <NavItem
          href='/admin'
          icon='ri-dashboard-fill'
          label='Dashboard'
          tooltip='Dashboard'
        />

        <NavGroup
          icon='ri-store-2-fill'
          label='Catalog'
          tooltip='Catalog'
          items={[
            {
              href: '/admin/all-products',
              label: 'All Products',
              icon: 'ri-list-check',
            },
            {
              href: '/admin/add-products',
              label: 'Add Product',
              icon: 'ri-add-box-fill',
            },
            {
              href: '/admin/categories',
              label: 'Categories',
              icon: 'ri-layout-grid-2-fill',
            },
            {
              href: '/admin/bundle-products',
              label: 'Bundles',
              icon: 'ri-stack-fill',
            },
            {
              href: '/admin/plans',
              label: 'Subscription Plans',
              icon: 'ri-price-tag-3-fill',
            },
          ]}
        />

        <NavGroup
          icon='ri-group-fill'
          label='Customers'
          tooltip='Customers'
          items={[
            {
              href: '/admin/users',
              label: 'All Users',
              icon: 'ri-user-fill',
            },
            {
              href: '/admin/subscribers',
              label: 'Subscribers',
              icon: 'ri-vip-crown-2-fill',
            },
          ]}
        />

        <NavGroup
          icon='ri-tools-fill'
          label='Operations'
          tooltip='Operations'
          items={[
            {
              href: '/admin/downloads',
              label: 'Downloads',
              icon: 'ri-download-cloud-fill',
            },
            {
              href: '/admin/custom-orders',
              label: 'Custom Orders',
              icon: 'ri-file-list-3-fill',
            },
          ]}
        />

        <NavGroup
          icon='ri-newspaper-fill'
          label='Content'
          tooltip='Content'
          items={[
            {
              href: '/admin/all-blogs',
              label: 'Blogs & Resources',
              icon: 'ri-news-line',
            },
            {
              href: '/admin/contact-submissions',
              label: 'Contact Submissions',
              icon: 'ri-mail-line',
            },
          ]}
        />

        <NavGroup
          icon='ri-settings-fill'
          label='Settings'
          tooltip='Settings'
          items={[
            {
              href: '/admin/settings/bypass-emails',
              label: 'Bypass Emails',
              icon: 'ri-mail-lock-line',
            },
            {
              href: '/admin/settings/scripts',
              label: 'Admin Scripts',
              icon: 'ri-terminal-box-line',
            },
          ]}
        />
      </ul>
    </aside>
  );
}
