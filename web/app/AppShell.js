"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { BrandName, SiteHeader } from "@/app/SiteHeader";
import { BottomNav } from "@/app/BottomNav";
import { showsBottomNav, splitNavigation } from "@/lib/shellRoutes";
import { SiteFooter } from "@/app/SiteFooter";
import { NavigationIcon } from "@/app/NavigationIcon";
import { PageTransition } from "@/app/PageTransition";

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

function DesktopSidebar({ navigation, pathname }) {
  const collapsed = useSyncExternalStore(
    subscribeToSidebar,
    sidebarSnapshot,
    serverSidebarSnapshot,
  );
  const visibleItems = navigation.filter((item) => item.enabled);

  return (
    <aside
      style={{ viewTransitionName: "cdp-site-sidebar" }}
      className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-surface transition-[width] duration-200 lg:flex lg:flex-col ${
        collapsed ? "w-[72px]" : "w-[248px]"
      }`}
      aria-label="Điều hướng chính"
    >
      <div className={`flex min-h-[72px] flex-wrap items-center border-b border-line py-2 ${collapsed ? "justify-center px-2" : "pl-4 pr-2"}`}>
        {/* A2-0 / Q5: mở rộng thì tên hiện nguyên văn, không cắt (thiếu chỗ thì xuống dòng theo từ). Thu gọn
            (khách tự chọn) chỉ còn logo, nên liên kết mang tên đầy đủ cho trình đọc màn hình + chú thích. */}
        <Link
          href="/"
          aria-label={collapsed ? "Chạm Địa Phương — Trang chủ" : undefined}
          title={collapsed ? "Chạm Địa Phương" : undefined}
          className={`flex items-center gap-2 ${collapsed ? "" : "flex-[1_1_0%]"}`}
        >
          {/* public/cdp-logo.png tỉ lệ 280×121. Cao 24px (rộng ~56px) để "Chạm Địa Phương"
              vừa một dòng trong sidebar 248px; thu gọn còn 20px để lọt khung 72px. */}
          <Image
            src="/cdp-logo.png"
            alt=""
            width={280}
            height={121}
            priority
            className={`max-w-none shrink-0 w-auto ${collapsed ? "h-5" : "h-6"}`}
          />
          {!collapsed && <BrandName className="text-sm font-semibold leading-tight text-ink" />}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Thu gọn thanh điều hướng"
            className="cdp-pressable ml-auto flex h-10 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2"
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}
      </div>

      {collapsed && (
        <div className="border-b border-line p-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Mở rộng thanh điều hướng"
            className="cdp-pressable flex h-11 w-full cursor-pointer items-center justify-center rounded-xl text-ink-2 hover:bg-surface-2"
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
                    ? "bg-action/10 font-medium text-action-hover"
                    : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <span className="shrink-0"><NavigationIcon itemKey={item.key} /></span>
                {!collapsed && <span className="truncate text-sm">{item.navLabel}</span>}
              </Link>
              {collapsed && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs text-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
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
  const { core } = splitNavigation(navigation);
  const bottomNav = showsBottomNav(pathname);

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
      {/* `cdp-site`: phạm vi token màu của trang khách (globals.css). Khung /admin ở trên không có lớp này.
          Đệm 2 bên theo vùng an toàn: layout.js bật viewport-fit=cover, khi xoay ngang iPhone nội dung không lấn
          vào tai thỏ (dọc thì bằng 0). */}
      <div className="cdp-site flex min-h-full flex-1 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <DesktopSidebar navigation={navigation} pathname={pathname} />
        {/* Khoảng trống đáy = chiều cao thật của thanh đáy (kể cả vùng an toàn), chỉ ở trang có thanh; desktop
            không có thanh nên biến bị gỡ và khoảng trống về 0. */}
        <div
          className="flex min-w-0 flex-1 flex-col transition-[padding] duration-200 lg:pl-[var(--cdp-sidebar-width,248px)]"
          style={bottomNav ? { paddingBottom: "var(--cdp-bottom-nav-h, 0px)" } : undefined}
        >
          <SiteHeader
            navigation={navigation}
            pathname={pathname}
            open={mobileMenuOpen}
            onOpenChange={setMobileMenuOpen}
          />
          <PageTransition pathname={pathname}>
            <div className="flex flex-1 flex-col">{children}</div>
          </PageTransition>
          <SiteFooter aboutLabel={aboutLabel} />
        </div>
      </div>
      {bottomNav && <BottomNav items={core} pathname={pathname} />}
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
