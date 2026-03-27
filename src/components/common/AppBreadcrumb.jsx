/**
 * AppBreadcrumb — Page breadcrumb navigation
 * ─────────────────────────────────────────────────────────────────
 * Props:
 *   items   { label: string, href?: string }[]
 *           Last item = current page (no href needed).
 *
 * Usage:
 *   <AppBreadcrumb
 *     items={[
 *       { label: 'Dashboard', href: '/dashboard' },
 *       { label: 'Students', href: '/students' },
 *       { label: 'John Doe' },
 *     ]}
 *   />
 */
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Fragment } from 'react';

export default function AppBreadcrumb({ items = [] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href ?? '#'}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
