'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PenTool, Layers, BarChart2, History, LogOut, Zap, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStandalone } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';

const NAV_ITEMS = [
  { href: '/analyze', icon: PenTool, labelKey: 'sidebar.analyze' },
  { href: '/flashcards', icon: Layers, labelKey: 'sidebar.flashcards' },
  { href: '/questions', icon: Brain, labelKey: 'sidebar.questions' },
  { href: '/stats', icon: BarChart2, labelKey: 'sidebar.stats' },
  { href: '/history', icon: History, labelKey: 'sidebar.history' },
];

/* ── Desktop tooltip ─────────────────────────────────────── */
function Tooltip({ label, visible, lang }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.span
          initial={{ opacity: 0, x: -6, scale: 0.92 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -6, scale: 0.92 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          className={`absolute ${lang === 'ar' ? 'right-[calc(100%+10px)]' : 'left-[calc(100%+10px)]'} top-1/2 -translate-y-1/2 z-[200] pointer-events-none`}
        >
          <span
            className="relative px-3 py-1.5 rounded-lg font-mono text-[15px] tracking-[.08em] font-semibold whitespace-nowrap block"
            style={{
              background: 'var(--color-bg-sidebar)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <span style={{
              position: 'absolute', right: '100%', top: '50%',
              transform: 'translateY(-50%)', width: 0, height: 0,
              borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
              borderRight: '5px solid var(--color-border)', display: 'block',
            }} />
            {label}
          </span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}

/* ── Sidebar ─────────────────────────────────────────────── */
export default function Sidebar({ isOpen, setIsOpen }) {
  const { t, lang } = useLanguage();
  const pathname = usePathname();
  const { logout } = useAuthStandalone(false); // false = Sidebar never redirects, page handles auth
  const [hovered, setHovered] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close on route change (mobile only)
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      if (isMobile) setIsOpen(false);
    }
  }, [pathname, isMobile, setIsOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, setIsOpen]);

  /* ── shared sidebar style ── */
  const sidebarStyle = {
    background: 'var(--color-bg-sidebar)',
    backdropFilter: 'blur(28px)',
    borderRight: !isMobile ? '1px solid var(--color-border)' : 'none',
    borderTop: isMobile ? '1px solid var(--color-border)' : 'none',
    boxShadow: isMobile
      ? '0 -10px 40px rgba(0,0,0,0.06)'
      : '8px 0 40px rgba(0,0,0,0.06)',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — both mobile & desktop */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90]"
            style={{ background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* ══════════════════════════════════════
              MOBILE — bottom sheet full menu
          ══════════════════════════════════════ */}
          {isMobile && (
            <motion.aside
              key="mobile-menu"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
              className="fixed bottom-0 left-0 right-0 z-[100] rounded-t-2xl flex flex-col pb-safe"
              style={{ ...sidebarStyle, maxHeight: 'min(82vh, 620px)', paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
              aria-label={t('sidebar.mainNavigation')}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.15)' }}
                />
              </div>

              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary), #b59dbf)',
                      boxShadow: '0 3px 12px rgba(156,123,172,0.3)',
                    }}
                  >
                    <Zap size={15} className="text-black" fill="black" />
                  </div>
                  <span
                    className="font-mono text-[15px] tracking-[.18em] font-bold uppercase"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    DeutAI
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setIsOpen(false)}
                  className="w-11 h-11 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'rgba(0,0,0,0.03)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  aria-label={t('nav.closeMenu')}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* Nav items */}
              <nav className="flex flex-col gap-1 px-3 py-3 overflow-y-auto" aria-label={t('sidebar.mainMenu')}>
                {NAV_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  const label = t(item.labelKey);
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + idx * 0.055, type: 'spring', stiffness: 340, damping: 28 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-4 px-4 py-3.5 min-h-14 rounded-xl relative overflow-hidden"
                        style={isActive ? {
                          background: 'linear-gradient(90deg,rgba(156,123,172,0.15),rgba(156,123,172,0.04))',
                          border: '1px solid rgba(156,123,172,0.28)',
                          color: 'var(--color-primary)',
                        } : {
                          border: '1px solid transparent',
                          color: 'var(--color-text-primary)',
                        }}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <span
                            className={`absolute ${lang === 'ar' ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'} top-1/2 -translate-y-1/2 w-[3px] h-6`}
                            style={{ background: 'var(--color-primary)', boxShadow: '0 0 8px rgba(156,123,172,0.4)' }}
                            aria-hidden="true"
                          />
                        )}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={isActive ? {
                            background: 'rgba(156,123,172,0.15)',
                            border: '1px solid rgba(156,123,172,0.2)',
                          } : {
                            background: 'rgba(0,0,0,0.03)',
                            border: '1px solid var(--color-border)',
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <span className="font-mono text-[15px] tracking-[.06em] font-semibold">
                          {label}
                        </span>
                        {isActive && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${lang === 'ar' ? 'mr-auto' : 'ml-auto'}`}
                            style={{ background: 'var(--color-primary)', boxShadow: '0 0 6px rgba(156,123,172,0.5)' }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Language Switcher and Logout */}
              <div
                className="px-3 pb-6 pt-2 flex items-center justify-between gap-2"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <LanguageSwitcher isMobile={true} />
                <button
                  onClick={logout}
                  className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-150 min-h-12"
                  style={{
                    background: 'rgba(204,85,85,0.08)',
                    border: '1px solid rgba(204,85,85,0.25)',
                    color: 'var(--color-error)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(204,85,85,0.1)', border: '1px solid rgba(204,85,85,0.2)' }}
                  >
                    <LogOut size={15} />
                  </div>
                  <span className="font-mono text-[15px] tracking-[.06em] font-semibold">
                    {t('sidebar.logout')}
                  </span>
                </button>
              </div>
            </motion.aside>
          )}

          {/* ══════════════════════════════════════
              DESKTOP — slim icon rail
          ══════════════════════════════════════ */}
          {!isMobile && (
            <motion.aside
              key="desktop-sidebar"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.7 }}
              className={`fixed top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} h-full z-[100] flex flex-col items-center py-5`}
              style={{ width: '68px', ...sidebarStyle }}
              aria-label={t('sidebar.mainNavigation')}
            >
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04, type: 'spring', stiffness: 320, damping: 22 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-2"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, #b59dbf 100%)',
                  boxShadow: '0 4px 18px rgba(156, 123, 172, 0.3)',
                }}
              >
                <Zap size={18} className="text-black" fill="black" />
              </motion.div>

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.09, type: 'spring', stiffness: 300, damping: 22 }}
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.88 }}
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 flex-shrink-0"
                style={{
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                aria-label={t('nav.closeMenu')}
              >
                <X size={15} />
              </motion.button>

              {/* Divider */}
              <div className="w-8 flex-shrink-0 mb-3" style={{ height: '1px', background: 'var(--color-border)' }} />

              {/* Nav items */}
              <nav className="flex flex-col gap-1.5 flex-1 items-center w-full px-2" aria-label={t('sidebar.mainMenu')}>
                {NAV_ITEMS.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  const label = t(item.labelKey);
                  return (
                    <motion.div
                      key={item.href}
                      className="relative w-full flex justify-center"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05, type: 'spring', stiffness: 340, damping: 28 }}
                      onMouseEnter={() => setHovered(item.href)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <Link
                        href={item.href}
                        className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
                        style={isActive ? {
                          background: 'linear-gradient(135deg,rgba(156,123,172,0.22),rgba(156,123,172,0.07))',
                          border: '1px solid rgba(156,123,172,0.32)',
                          color: 'var(--color-primary)',
                          boxShadow: '0 0 14px rgba(156,123,172,0.14)',
                        } : {
                          background: hovered === item.href ? 'rgba(156,123,172,0.08)' : 'transparent',
                          border: '1px solid ' + (hovered === item.href ? 'rgba(156,123,172,0.15)' : 'transparent'),
                          color: hovered === item.href ? 'var(--color-primary)' : 'var(--color-text-primary)',
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={label}
                      >
                        {isActive && (
                          <span
                            className={`absolute ${lang === 'ar' ? '-right-[3px] rounded-l-full' : '-left-[3px] rounded-r-full'} top-1/2 -translate-y-1/2 w-[3px] h-5`}
                            style={{ background: 'var(--color-primary)', boxShadow: '0 0 8px rgba(156,123,172,0.4)' }}
                            aria-hidden="true"
                          />
                        )}
                        <Icon size={17} />
                      </Link>
                      <Tooltip label={label} visible={hovered === item.href} lang={lang} />
                    </motion.div>
                  );
                })}
              </nav>

              {/* Lang + Logout */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative flex flex-col items-center w-full px-2 pt-3 gap-2"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <LanguageSwitcher />

                <div
                  className="relative flex justify-center w-full"
                  onMouseEnter={() => setHovered('logout')}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                  onClick={logout}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
                  style={{
                    background: hovered === 'logout' ? 'rgba(204,85,85,0.12)' : 'transparent',
                    border: '1px solid ' + (hovered === 'logout' ? 'rgba(204,85,85,0.25)' : 'transparent'),
                    color: hovered === 'logout' ? 'var(--color-error)' : '#c07070',
                  }}
                  aria-label={t('sidebar.logout')}
                >
                  <LogOut size={16} />
                </button>
                <Tooltip label={t('sidebar.logout')} visible={hovered === 'logout'} lang={lang} />
                </div>
              </motion.div>

            </motion.aside>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
