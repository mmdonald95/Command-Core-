import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import OfflineSyncBanner from "@/components/ui/OfflineSyncBanner";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import PipelineIcon from "@/components/ui/PipelineIcon";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  DollarSign,
  Receipt,
  FileText,
  LogOut,
  Menu,
  Shield,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Clock,
  User,
  Package,
  Monitor,
  Smartphone,
  MoreVertical,
  ChevronLeft,
  X } from
"lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter } from
"@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator } from
"@/components/ui/dropdown-menu";

const getNavigationItems = (userRole) => {
  const items = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Projects", url: createPageUrl("Projects"), icon: FolderKanban },
  { title: "Reports", url: createPageUrl("Reports"), icon: BarChart3, adminOnly: true },
  { title: "Material Usage", url: createPageUrl("MaterialUsageReport"), icon: Package, adminOnly: true },
  { title: "Safety Meetings", url: createPageUrl("SafetyMeetings"), icon: Shield },
  { title: "Receipt Uploads", url: createPageUrl("ReceiptUploads"), icon: Receipt },
  { title: "Crew", url: createPageUrl("Crew"), icon: Users, adminOnly: true },
  { title: "Payroll", url: createPageUrl("Payroll"), icon: DollarSign, adminOnly: true },
  { title: "Time Approval", url: createPageUrl("TimeApproval"), icon: CheckCircle },
  { title: "Time Cards", url: createPageUrl("TimeCards"), icon: Clock },
  { title: "Daily Reports", url: createPageUrl("DailyReports"), icon: FileText },
  { title: "Users", url: createPageUrl("Users"), icon: Users, adminOnly: true },
  { title: "My Profile", url: createPageUrl("MyProfile"), icon: User }];

  if (userRole === 'manager') {
    return items.filter((item) => !item.adminOnly);
  }
  return items;
};

const getMobileNavItems = () => [
{ title: "Home", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
{ title: "Projects", url: createPageUrl("Projects"), icon: FolderKanban },
{ title: "Safety", url: createPageUrl("SafetyMeetings"), icon: Shield },
{ title: "Time", url: createPageUrl("TimeApproval"), icon: CheckCircle },
{ title: "Profile", url: createPageUrl("MyProfile"), icon: User }];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('layoutViewMode');
    if (saved) return saved;
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('layoutViewMode', viewMode);
  }, [viewMode]);

  // Auto-detect device type on window resize
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? 'mobile' : 'desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = () => {base44.auth.logout();};
  const handleRequestFeature = () => {window.location.href = 'mailto:support@base44.com';};

  // Preserve scroll position per route for bottom nav tabs
  const scrollPositions = React.useRef({});
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Restore saved scroll position for this route
    el.scrollTop = scrollPositions.current[location.pathname] || 0;
    // Save scroll on scroll
    const onScroll = () => {
      scrollPositions.current[location.pathname] = el.scrollTop;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  const queryClient = useQueryClient();

  // Dark mode: follow system preference
  useEffect(() => {
    const applyTheme = (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mq);
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, []);

  // Pull-to-refresh: refresh all active queries
  const { isPulling, isRefreshing } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries();
  });

  const effectiveRole = user?.app_role || user?.role;
  const isCrewMemberOnly = user && effectiveRole !== 'admin' && effectiveRole !== 'manager';
  const isMobileView = viewMode === 'mobile';
  const isAdminOrManager = effectiveRole === 'admin' || effectiveRole === 'manager';

  const ViewModeToggle = () =>
  <div className="flex items-center bg-slate-700 rounded-lg p-1">
      <button
      onClick={() => setViewMode('desktop')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
      viewMode === 'desktop' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`
      }>
      
        <Monitor className="w-4 h-4" />
        <span className="hidden sm:inline">Desktop</span>
      </button>
      <button
      onClick={() => setViewMode('mobile')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
      viewMode === 'mobile' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`
      }>
      
        <Smartphone className="w-4 h-4" />
        <span className="hidden sm:inline">Mobile</span>
      </button>
    </div>;


  return (
    <SidebarProvider>
      <OfflineSyncBanner />
      <style>{`
        :root {
          --primary: 217 91% 60%;
          --primary-foreground: 0 0% 100%;
          --secondary: 210 40% 96%;
          --secondary-foreground: 217 91% 60%;
          --accent: 217 91% 60%;
          --accent-foreground: 0 0% 100%;
          --muted: 210 40% 96%;
          --muted-foreground: 215 16% 47%;
        }
        .mobile-view button, .mobile-view a, .mobile-view [role="button"] {
          min-height: 48px;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        [class*="base44"],
        [id*="base44"],
        a[href*="base44.com"],
        div[style*="position: fixed"][style*="bottom"]:not(.safe-area-bottom),
        div[style*="position: fixed"][style*="z-index: 999"],
        div[style*="position: fixed"][style*="z-index: 9999"],
        [style*="background-color: rgb(0, 0, 0)"][style*="position: fixed"],
        [style*="background: rgb(0, 0, 0)"][style*="position: fixed"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `}</style>

      <div className={`min-h-screen flex w-full bg-slate-50 ${isMobileView ? 'mobile-view' : ''}`}>

        {/* Desktop Sidebar */}
        {isAdminOrManager && !isMobileView &&
        <Sidebar className="border-r border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800">
            <SidebarHeader className="border-b border-slate-700 p-6 bg-slate-800">
              <div className="flex items-center gap-3">
                <PipelineIcon className="w-10 h-10" />
                <div>
                  <h2 className="font-bold text-white text-lg">Precision Pipeline</h2>
                  <p className="text-xs text-slate-300">& Drilling, LLC</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-2 md:p-3">
              <SidebarGroup className="bg-[hsl(var(--muted))] p-2 relative flex w-full min-w-0 flex-col">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {getNavigationItems(effectiveRole).map((item) =>
                  <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                      asChild
                      className={`hover:bg-slate-800 transition-colors duration-200 rounded-lg mb-1 ${
                      location.pathname === item.url ? 'bg-slate-800 text-blue-400' : 'text-slate-100'}`
                      }>
                      
                          <Link to={item.url} className="flex items-center gap-3 py-4 md:py-3 px-3">
                            <item.icon className="w-7 h-7 md:w-6 md:h-6 flex-shrink-0" />
                            <span
                          className="font-semibold text-lg md:text-base"
                          style={{ color: location.pathname === item.url ? '#60a5fa' : '#1e3a8a' }}>
                          
                              {item.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-700 p-3 bg-slate-800">
              <div className="space-y-2">
                <div className="flex justify-center mb-2">
                  <ViewModeToggle />
                </div>
                {user &&
              <div className="px-3 py-2 bg-slate-700 rounded-lg">
                    <p className="font-bold text-white text-base">{user.display_name || user.full_name || user.email}</p>
                    <p className="text-slate-300 text-sm">
                      {user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Manager' : 'User'}
                    </p>
                  </div>
              }
                <Button onClick={handleRequestFeature} variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-slate-700 text-base font-semibold">
                  <FileText className="w-5 h-5 mr-3" />
                  Request Feature
                </Button>
                <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-white hover:text-white hover:bg-slate-700 text-base font-semibold">
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
        }

        <main className="flex-1 flex flex-col">

          {/* Desktop small-screen header */}
          {isAdminOrManager && !isMobileView &&
          <header className="bg-white border-b border-slate-200 px-6 py-4 lg:hidden shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-6 h-6 text-slate-700" />
                    </Button>
                  </SidebarTrigger>
                  <div className="flex items-center gap-2">
                    <PipelineIcon className="w-8 h-8" />
                    <div>
                      <h1 className="font-bold text-slate-900 text-sm">Precision Pipeline</h1>
                      <p className="text-xs text-slate-600">& Drilling, LLC</p>
                    </div>
                  </div>
                </div>
                <ViewModeToggle />
              </div>
            </header>
          }

          {/* Mobile header */}
          {isAdminOrManager && isMobileView &&
          <header
            className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 shadow-lg sticky top-0 z-40"
            style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))', paddingBottom: '0.75rem' }}>
            
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-slate-700 -ml-2"
                      >
                        <Menu className="w-6 h-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 p-0">
                      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PipelineIcon className="w-8 h-8" />
                          <div>
                            <h2 className="font-bold text-white text-sm">Precision Pipeline</h2>
                            <p className="text-xs text-slate-300">& Drilling, LLC</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-slate-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <SidebarMenu>
                          {getNavigationItems(effectiveRole).map((item) =>
                        <SidebarMenuItem key={item.title} className="mb-2">
                              <SidebarMenuButton
                            asChild
                            onClick={() => setMobileMenuOpen(false)}
                            className={`hover:bg-slate-800 transition-colors rounded-lg ${
                            location.pathname === item.url ? 'bg-slate-800 text-blue-400' : 'text-slate-100'}`}
                            >
                            
                                <Link to={item.url} className="flex items-center gap-3 py-2 px-3">
                                  <item.icon className="w-5 h-5" />
                                  <span className="text-sm font-medium">{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        </SidebarMenu>
                      </div>
                    </SheetContent>
                  </Sheet>
                  {!isRoot &&
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-slate-700 -ml-2"
                  onClick={() => navigate(-1)}>
                  
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                }
                  <PipelineIcon className="w-10 h-10" />
                  <div>
                    <h1 className="font-bold text-white text-base">Precision Pipeline</h1>
                    <p className="text-xs text-slate-300">& Drilling, LLC</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                      <MoreVertical className="w-6 h-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {user &&
                  <>
                        <div className="px-2 py-2">
                          <p className="font-semibold text-sm">{user.display_name || user.full_name || user.email}</p>
                          <p className="text-xs text-slate-500">
                            {user.role === 'admin' ? 'Administrator' : user.role === 'manager' ? 'Manager' : 'User'}
                          </p>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                  }
                    <DropdownMenuItem onClick={handleRequestFeature}>
                      <FileText className="w-4 h-4 mr-2" />
                      Request Feature
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
          }

          {/* Crew member header */}
          {isCrewMemberOnly &&
          <header className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 shadow-lg sticky top-0 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PipelineIcon className="w-10 h-10" />
                  <div>
                    <h1 className="font-bold text-white text-base">Precision Pipeline</h1>
                    <p className="text-xs text-slate-300">& Drilling, LLC</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {user &&
                <div className="hidden sm:block text-right">
                      <p className="font-semibold text-white text-sm">{user.display_name || user.full_name || user.email}</p>
                      <p className="text-xs text-slate-300">Crew Member</p>
                    </div>
                }
                  <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 border-slate-600 text-white hover:bg-slate-700">
                  
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              </div>
            </header>
          }

          <div ref={scrollRef} className={`flex-1 overflow-auto ${isMobileView ? 'pb-24' : 'pb-0'}`}>
            {/* Pull-to-refresh indicator */}
            {(isPulling || isRefreshing) &&
            <div className="flex items-center justify-center py-3 text-sm text-slate-500">
                {isRefreshing ?
              <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Refreshing...</span> :

              <span>↓ Release to refresh</span>
              }
              </div>
            }
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}>
                
                {children || <Outlet />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Bottom Navigation */}
          {isAdminOrManager && isMobileView &&
          <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50 safe-area-bottom shadow-lg">
              <div className="flex items-center justify-around py-4">
                {getMobileNavItems().map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault();
                        // Reset scroll position for this tab
                        if (scrollRef.current) scrollRef.current.scrollTop = 0;
                        if (scrollPositions.current) scrollPositions.current[item.url] = 0;
                        navigate(item.url, { replace: true });
                      }
                    }}
                    className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg min-w-[72px] transition-colors ${
                    isActive ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-300'}`
                    }>
                    
                      <item.icon className={`w-8 h-8 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className={`text-sm font-semibold ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                        {item.title}
                      </span>
                    </Link>);

              })}
              </div>
            </nav>
          }

        </main>
      </div>
    </SidebarProvider>);

}