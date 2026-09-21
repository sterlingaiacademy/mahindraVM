"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PhoneOutgoing, ScrollText, Settings, LogOut, PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Call Logs (Sheets)", href: "/dashboard/logs", icon: ScrollText },
    { label: "Raw Transcripts", href: "/dashboard/transcripts", icon: ScrollText },
    { label: "Outbound Trigger", href: "/dashboard/outbound", icon: PhoneOutgoing },
    { label: "Account Config", href: "/dashboard/config", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className={cn(
        "bg-gray-100 dark:bg-mahindra-black border-r border-gray-200 dark:border-white/5 flex flex-col transition-all duration-300 relative z-40",
        isCollapsed ? "w-[72px]" : "w-64"
      )}>
        {/* Header - ElevenLabs Style */}
        <div className={cn(
          "h-16 flex items-center border-b border-gray-200 dark:border-white/5 transition-all shrink-0",
          isCollapsed ? "justify-center px-0" : "px-4 gap-3"
        )}>
          {/* Toggle Button (Far Left) */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-2 text-gray-500 hover:text-black dark:hover:text-white rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          
          {/* Logo (Hidden when collapsed) */}
          {!isCollapsed && (
            <Link href="/" className="flex items-center overflow-hidden ml-2">
              <div className="flex flex-col">
                <img src="/text_logo_black.png" alt="Mahindra Text" className="h-[40px] w-auto object-contain dark:hidden opacity-90 shrink-0" />
                <img src="/text_logo_white.png" alt="Mahindra Text" className="h-[40px] w-auto object-contain hidden dark:block opacity-90 shrink-0" />
              </div>
            </Link>
          )}
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-visible px-3">
          {!isCollapsed && <div className="px-3 mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Admin Panel</div>}
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "relative flex items-center transition-colors uppercase tracking-wide rounded-md group",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                  isActive 
                    ? "bg-mahindra-red/10 text-mahindra-red" 
                    : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                
                {/* Active Indicator Line */}
                {isActive && !isCollapsed && <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-mahindra-red" />}
                {isActive && isCollapsed && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r bg-mahindra-red" />}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-900 dark:border-r-white" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className={cn(
          "p-4 border-t border-gray-200 dark:border-white/5 flex transition-all", 
          isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between"
        )}>
          <div className="relative group flex items-center justify-center">
            <ThemeToggle />
            {isCollapsed && (
              <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                Theme Settings
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-900 dark:border-r-white" />
              </div>
            )}
          </div>
          
          <button onClick={() => { document.cookie = "is_admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; window.location.href = "/"; }} className={cn(
            "relative flex items-center transition-colors uppercase tracking-wide group rounded-md", 
            isCollapsed ? "justify-center p-2 hover:bg-black/5 dark:hover:bg-white/10" : "gap-3 text-sm font-medium hover:text-black dark:text-gray-400 dark:hover:text-white"
          )}>
            <LogOut className="w-5 h-5 text-gray-500 hover:text-black dark:hover:text-white" />
            {!isCollapsed && <span className="text-gray-500 hover:text-black dark:hover:text-white">Logout</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 top-1/2 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl">
                Logout
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[4px] border-r-gray-900 dark:border-r-white" />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gradient-to-br dark:from-mahindra-dark dark:to-black transition-colors duration-300 relative z-0">
        {children}
      </main>
    </div>
  );
}
