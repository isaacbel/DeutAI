'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenTool, Layers, BarChart2, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStandalone } from '@/lib/auth';

const NAV_ITEMS = [
  { href: '/analyze',    icon: PenTool,   label: 'Analyse' },
  { href: '/flashcards', icon: Layers,    label: 'Flashcards' },
  { href: '/stats',      icon: BarChart2, label: 'Stats' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { logout } = useAuthStandalone();

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Container */}
          <motion.aside 
            initial={{ x: '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed top-0 left-0 h-full w-64 bg-[#080809]/95 backdrop-blur-xl border-r border-[#16161c] z-[70] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
          >
            <div className="p-6 flex items-center justify-between border-b border-[#16161c]">
              <h1 className="text-xl font-bold text-[#C9A227] font-mono tracking-[0.2em] flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
                DeutAI
              </h1>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)} 
                className="text-[#7d7d8f] hover:text-[#f3f4fa] transition-colors p-1 bg-[#111118] rounded-md border border-[#2d2d38]"
              >
                <X size={18} />
              </motion.button>
            </div>

            <nav className="flex-1 py-8 px-4 flex flex-col gap-3 overflow-y-auto">
              {NAV_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all relative overflow-hidden ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#C9A227]/10 to-transparent text-[#C9A227] shadow-[inset_0_0_0_1px_rgba(201,162,39,0.2),0_0_20px_rgba(201,162,39,0.05)]' 
                          : 'text-[#8f8fa0] hover:bg-[#111118] hover:text-[#d7d7e3]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#C9A227] rounded-r shadow-[0_0_12px_rgba(201,162,39,0.8)]" />
                      )}
                      <Icon size={18} className={`transition-colors ${isActive ? 'text-[#C9A227]' : 'text-[#7d7d8f] group-hover:text-[#d7d7e3]'}`} />
                      <span className="font-mono text-[13px] tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 border-t border-[#16161c]"
            >
              <button
                onClick={logout}
                className="w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all text-[#a65c5c] hover:bg-[#1a0a0a] hover:text-[#e06c6c] hover:shadow-[inset_0_0_0_1px_rgba(204,85,85,0.2)]"
              >
                <LogOut size={18} className="group-hover:translate-x-[-2px] transition-transform" />
                <span className="font-mono text-[13px] tracking-wide" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  Déconnexion
                </span>
              </button>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
