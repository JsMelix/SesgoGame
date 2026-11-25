import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 metal-frame-sm px-3 py-1.5 bg-[#78350F] text-[#FEF3C7] text-xs font-semibold flex items-center gap-2">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Modo sin conexión activo</span>
    </div>
  );
}
