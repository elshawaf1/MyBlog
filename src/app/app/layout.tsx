import VaultSidebar from '@/components/layout/VaultSidebar';
import { VaultGate } from '@/components/layout/VaultGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <VaultGate>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:py-14">
        <VaultSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </VaultGate>
  );
}
