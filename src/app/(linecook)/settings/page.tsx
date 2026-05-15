import { getRole } from '@/lib/get-role';
import { BottomNav } from '@/components/BottomNav';
import { LanguageToggle } from '@/components/LanguageToggle';
import SettingsContent from './SettingsContent';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const role = (await getRole()) ?? 'linecook';

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <header className="bg-white border-b-2 border-[#001b3c] h-[64px] fixed top-0 z-50 w-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#001b3c]">settings</span>
          <span className="font-grotesk font-black uppercase text-[#001b3c] text-xl tracking-tight">
            PELLITO HUB
          </span>
        </div>
        <LanguageToggle />
      </header>

      <SettingsContent role={role} />

      <BottomNav activeTab="settings" />
    </div>
  );
}
