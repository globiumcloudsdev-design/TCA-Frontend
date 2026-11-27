'use client';

import { useState } from 'react';
import usePortalStore from '@/store/portalStore';
import PublishedTestRecords from './PublishedTestRecords';
import { NativeSelect, FieldLabel } from './shared';

/** Parent portal: child switcher + that child's published test records. */
export default function ParentTestRecordsTab() {
  const portalUser = usePortalStore((s) => s.portalUser);
  const children = portalUser?.children || [];
  const [childId, setChildId] = useState('');
  const activeId = childId || children[0]?.id || '';

  const nameOf = (c) => c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.registration_no || 'Child';

  return (
    <div className="space-y-4">
      {children.length > 1 && (
        <div className="max-w-xs">
          <FieldLabel>Child</FieldLabel>
          <NativeSelect
            value={activeId}
            onChange={setChildId}
            options={children.map((c) => ({ value: c.id, label: nameOf(c) }))}
            placeholder="Select child"
          />
        </div>
      )}
      {children.length === 1 && <p className="text-sm font-semibold text-tca-dark">{nameOf(children[0])}</p>}
      <PublishedTestRecords key={activeId} mode="parent" childId={activeId} />
    </div>
  );
}
