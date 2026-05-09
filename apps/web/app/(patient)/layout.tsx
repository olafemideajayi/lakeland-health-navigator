import { BottomNav } from '@/components/ui/bottom-nav';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">
      {children}
      <BottomNav />
    </div>
  );
}
