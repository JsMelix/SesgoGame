import { Download, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { retroAudio } from '../utils/audio';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => {
          retroAudio.playUiClick();
          void install();
        }}
        className="metal-btn inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2434] text-[#F59E0B] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
      >
        <Download className="w-4 h-4" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            retroAudio.playUiClick();
            setShowIOSGuide(true);
          }}
          className="metal-btn inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B2434] text-[#F59E0B] font-pixel text-xs whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
        >
          <Smartphone className="w-4 h-4" />
          <span>Instalar iOS</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="metal-frame w-full max-w-sm p-5 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-sm text-[#F59E0B]">Instalar en iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Cerrar"
                  className="metal-btn p-2 bg-[#1B2434] text-[#F8FAFC] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">
                1. Pulsa el botón <strong>Compartir</strong> en Safari.<br />
                2. Selecciona <strong>Añadir a pantalla de inicio</strong> para jugar a pantalla completa.
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
