'use client';

export default function VoucherFooter() {
  return (
    <footer className="mt-1 flex items-end justify-between text-[10px]">
      <div>
        <p className="font-semibold">Late fee policy applies after due date.</p>
      </div>
      <div className="whitespace-nowrap">
        <span className="font-semibold">Authorized Signature:</span> __________________
      </div>
    </footer>
  );
}
