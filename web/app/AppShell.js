"use client";

import Link from "next/link";
import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/app/SiteHeader";
import { SiteFooter } from "@/app/SiteFooter";

const SIDEBAR_STORAGE_KEY = "cdp-sidebar-collapsed";
const NavigationContext = createContext([]);

function subscribeToSidebar(callback) {
  function handleStorage(event) {
    if (event.key === SIDEBAR_STORAGE_KEY) callback();
  }
  window.addEventListener("storage", handleStorage);
  window.addEventListener("cdp-sidebar-change", callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("cdp-sidebar-change", callback);
  };
}

function sidebarSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
}

function serverSidebarSnapshot() {
  return false;
}

function setSidebarCollapsed(value) {
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, value ? "1" : "0");
  window.dispatchEvent(new Event("cdp-sidebar-change"));
}

function isActive(item, pathname) {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavigationIcon({ itemKey, size = 20 }) {
  const common = {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (itemKey === "notes") {
    return (
      <svg {...common}>
        <path d="M6 3.5h9l3 3v14H6z" />
        <path d="M15 3.5v3h3M9 11h6M9 15h5" />
      </svg>
    );
  }
  if (itemKey === "notebooks") {
    return (
      <svg {...common}>
        <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
        <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19M9 8h6" />
      </svg>
    );
  }
  if (itemKey === "about") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
    </svg>
  );
}

function DesktopSidebar({ navigation, pathname }) {
  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    sidebarSnapshot,
    serverSidebarSnapshot,
  );
  const visibleItems = navigation.filter((item) => item.enabled);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 hidden border-r border-zinc-200 bg-white transition-[width] duration-200 lg:flex lg:flex-col ${
        collapsed ? "w-[72px]" : "w-[248px]"
      }`}
      aria-label="Điều hướng chính"
    >
      <div className={`flex h-[72px] items-center border-b border-zinc-100 ${collapsed ? "justify-center px-2" : "justify-between px-5"}`}>
        <Link href="/" className="inline-flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-xl font-bold text-[#c8553d]">CDP</span>
          {!collapsed && <span className="truncate text-sm font-semibold text-zinc-900">Chạm Địa Phương</span>}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Thu gọn thanh điều hướng"
            className="cdp-pressable flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}
      </div>

      {collapsed && (
        <div className="border-b border-zinc-100 p-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Mở rộng thanh điều hướng"
            className="cdp-pressable flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visibleItems.map((item) => {
          const active = isActive(item, pathname);
          return (
            <div key={item.key} className="group relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? item.navLabel : undefined}
                className={`cdp-pressable flex min-h-11 items-center rounded-xl transition-colors ${
                  collapsed ? "justify-center px-2" : "gap-3 px-3"
                } ${
                  active
                    ? "bg-[#c8553d]/10 font-medium text-[#a83f2b]"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span className="shrink-0"><NavigationIcon itemKey={item.key} /></span>
                {!collapsed && <span className="truncate text-sm">{item.navLabel}</span>}
              </Link>
              {collapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  {item.navLabel}
                </span>
              )}
            </div>
          );
        })}
      </nav>

    </aside>
  );
}

export function PageTitle({ pageKey, fallback, className = "" }) {
  const navigation = useContext(NavigationContext);
  const item = navigation.find((entry) => entry.key === pageKey);
  return <h1 className={className}>{item?.pageTitle ?? fallback}</h1>;
}

export function AppShell({ navigation, children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const aboutLabel = navigation.find((item) => item.key === "about")?.navLabel;

  if (pathname.startsWith("/admin")) {
    return (
      <NavigationContext.Provider value={navigation}>
        <div className="flex min-h-full flex-1 flex-col">
          {children}
          <SiteFooter aboutLabel={aboutLabel} />
        </div>
      </NavigationContext.Provider>
    );
  }

  return (
    <NavigationContext.Provider value={navigation}>
      <div className="flex min-h-full flex-1">
        <DesktopSidebar navigation={navigation} pathname={pathname} />
        <div className="flex min-w-0 flex-1 flex-col transition-[padding] duration-200 lg:pl-[var(--cdp-sidebar-width,248px)]">
          <SiteHeader
            navigation={navigation}
            pathname={pathname}
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
          />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter aboutLabel={aboutLabel} />
        </div>
      </div>
      <SidebarWidthSync />
    </NavigationContext.Provider>
  );
}

function SidebarWidthSync() {
  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    sidebarSnapshot,
    serverSidebarSnapshot,
  );

  return (
    <style>{`:root { --cdp-sidebar-width: ${collapsed ? "72px" : "248px"}; }`}</style>
  );
}
