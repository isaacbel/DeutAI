'use client';
import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import OfflineBanner from '@/components/UI/OfflineBanner';
import ColdStartLoader from '@/components/UI/ColdStartLoader';
import { ping } from '@/lib/api';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

const SIDEBAR_STORAGE_KEY = 'deutai:sidebar-open';

export default function AppShell({ children }) {
  const { t, lang } = useLanguage();
  const [offline, setOffline]           = useState(false);
  const [coldStartDone, setColdStartDone] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Restore sidebar state — default open on desktop
    const savedOpen  = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const isDesktop  = window.innerWidth >= 768;
    setIsSidebarOpen(isDesktop ? savedOpen !== 'false' : false);

    setOffline(!navigator.onLine);
    const onOnline  = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);

    ping().catch(() => {}).finally(() => setColdStartDone(true));

    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('resize',  handleResize);
    };
  }, []);

  const setSidebarOpen = useCallback((val) => {
    setIsSidebarOpen(val);
    if (typeof val === 'boolean' && window.innerWidth >= 768) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(val));
    }
  }, []);

  if (!coldStartDone) return <ColdStartLoader />;

  return (
    /* Sidebar always overlays — no content push */
    <div className="min-h-screen bg-[#08080a] w-full overflow-x-hidden relative" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col min-h-screen">

        {/* ── Mobile hamburger — top-right corner ── */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button
              key="mobile-hamburger"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 360, damping: 26 }}
              onClick={() => setSidebarOpen(true)}
              className={`md:hidden fixed top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-50 w-10 h-10 rounded-xl flex items-center justify-center`}
              style={{
                background: 'rgba(14,14,22,0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#c6ccdf',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              aria-label={t('nav.openMenu')}
            >
              <Menu size={17} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Desktop FAB — bottom-left, visible when sidebar closed ── */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button
              key="desktop-fab"
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 10 }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
              onClick={() => setSidebarOpen(true)}
              className={`hidden md:flex fixed z-50 bottom-6 ${lang === 'ar' ? 'right-5' : 'left-5'} w-12 h-12 rounded-full items-center justify-center cursor-pointer select-none`}
              style={{
                background: 'linear-gradient(135deg,#C9A227,#f1d98d)',
                boxShadow: '0 4px 22px rgba(201,162,39,0.5), 0 0 0 1px rgba(201,162,39,0.2)',
                color: '#000',
              }}
              aria-label={t('nav.openMenu')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.91 }}
            >
              <Menu size={20} strokeWidth={2.2} />
            </motion.button>
          )}
        </AnimatePresence>

        {offline && <OfflineBanner />}

        <main className={`flex-1 w-full ${offline ? 'pt-10' : ''}`} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}