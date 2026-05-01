'use client';
import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import OfflineBanner from '@/components/UI/OfflineBanner';
import ColdStartLoader from '@/components/UI/ColdStartLoader';
import { ping } from '@/lib/api';

export default function AppShell({ children }) {
  const [offline, setOffline] = useState(false);
  const [coldStartDone, setColdStartDone] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Initialize sidebar state on desktop
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }

    // Online/offline detection
    setOffline(!navigator.onLine);
    const onOnline  = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    // Cold start ping
    async function doPing() {
      try {
        await ping();
      } catch {
        // server down — still show app
      } finally {
        setColdStartDone(true);
      }
    }
    doPing();

    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!coldStartDone) {
    return <ColdStartLoader />;
  }

  return (
    <div className="min-h-screen bg-[#080809] w-full overflow-x-hidden relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Main Content Wrapper */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>
        
        {/* Hamburger Toggle (Visible when sidebar is closed) */}
        <AnimatePresence>
          {!isSidebarOpen && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={() => setIsSidebarOpen(true)}
              className="fixed z-[50] bottom-6 left-6 p-4 rounded-full bg-[#C9A227] text-black shadow-[0_4px_20px_rgba(201,162,39,0.4)] hover:bg-[#d4af37] hover:scale-105 active:scale-95 transition-all md:p-3"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} className="md:w-5 md:h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {offline && <OfflineBanner />}
        
        {/* Page Content: Unrestricted width for fluid layouts */}
        <main className={`flex-1 w-full ${offline ? 'pt-[40px]' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
