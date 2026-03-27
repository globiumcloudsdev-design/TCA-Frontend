/**
 * useConfirm — replaces window.confirm with a programmatic promise.
 * Basic implementation; replace with a modal dialog later.
 */
'use client';

export function useConfirm() {
  const confirm = (message) => new Promise((resolve) => {
    // eslint-disable-next-line no-alert
    resolve(window.confirm(message));
  });
  return { confirm };
}
