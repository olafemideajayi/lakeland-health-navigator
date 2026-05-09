'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StaffAuthGate } from '../../components/staff/staff-auth-gate';

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/controls', label: 'Controls', icon: '⚙️' },
  { href: '/queue', label: 'Queue', icon: '👥' },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <StaffAuthGate>
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
        {children}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 safe-bottom z-50">
          <div className="flex">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                    active ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  <span className="text-[22px]">{tab.icon}</span>
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </StaffAuthGate>
  );
}
