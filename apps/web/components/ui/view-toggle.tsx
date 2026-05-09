'use client';

import { useRouter, usePathname } from 'next/navigation';

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isStaff = pathname.startsWith('/dashboard') || pathname.startsWith('/controls') || pathname.startsWith('/queue');

  return (
    <div className="flex mx-5 mt-3 bg-white/15 rounded-lg p-0.5">
      <button
        onClick={() => router.push('/')}
        className={`flex-1 py-2 text-[13px] font-semibold rounded-md transition-all ${
          !isStaff ? 'bg-white text-primary' : 'text-white/70'
        }`}
      >
        Patient View
      </button>
      <button
        onClick={() => router.push('/dashboard')}
        className={`flex-1 py-2 text-[13px] font-semibold rounded-md transition-all ${
          isStaff ? 'bg-white text-primary' : 'text-white/70'
        }`}
      >
        Clinic Staff
      </button>
    </div>
  );
}
