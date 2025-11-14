import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  List,
  Settings,
  Menu,
  Power,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tr } from '@/lib/locales/tr';
const dashboardItem = { href: '/', label: tr.nav.dashboard, icon: LayoutDashboard };
const navGroups = [
  {
    title: tr.nav.dialer,
    items: [
      { href: '/campaigns', label: tr.nav.campaigns, icon: PhoneCall },
      { href: '/call-lists', label: tr.nav.callLists, icon: List },
    ],
  },
  {
    title: tr.nav.account,
    items: [
      { href: '/billing', label: tr.nav.billing, icon: CreditCard },
      { href: '/settings', label: tr.nav.settings, icon: Settings },
    ],
  },
];
const NavContent = () => {
  return (
    <>
      <div className="flex h-16 items-center px-4 border-b border-gray-800">
        <h1 className="text-2xl font-display text-white">{tr.appTitle}</h1>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <NavLink
          to={dashboardItem.href}
          end={true}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700',
              isActive && 'bg-blue-600 text-white'
            )
          }
        >
          <dashboardItem.icon className="h-5 w-5" />
          {dashboardItem.label}
        </NavLink>
        <div className="pt-2 space-y-2">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <h3 className="px-3 pt-2 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                {group.title}
              </h3>
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-700',
                      isActive && 'bg-blue-600 text-white'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};
export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const allNavItems = [dashboardItem, ...navGroups.flatMap(g => g.items)];
  const pageTitle = allNavItems.find(item => {
    if (item.href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.href);
  })?.label || 'Details';
  return (
    <TooltipProvider>
      <div className="min-h-screen w-full bg-slate-100 dark:bg-gray-900">
        <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 md:w-64 bg-gray-900 text-white">
          <NavContent />
        </aside>
        <div className="md:pl-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col bg-gray-900 text-white p-0 w-64 border-r-0">
                <NavContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{pageTitle}</h1>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle className="relative top-0 right-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => console.log('Logout action triggered')}
                  >
                    <Power className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tr.nav.logout}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <footer className="p-4 text-center text-sm text-muted-foreground">
            Built with ❤️ at Cloudflare
          </footer>
        </div>
        <Toaster richColors />
      </div>
    </TooltipProvider>
  );
}