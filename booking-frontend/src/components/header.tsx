"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearTokens } from "@/lib/api-helper";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    if (token && !["/login", "/register"].includes(pathname)) {
      setUserName(Cookies.get("userName") || "");
      setUserRole(Cookies.get("roleName") || "");
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {}
    finally {
      clearTokens();
      router.push("/login");
    }
  };

  if (["/login", "/register"].includes(pathname)) return null;

  const allMainLinks = [
    {
      href: "/bookings", label: "จองสนาม", roles: ["Member"],
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 13h2M8 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      href: "/adminbookings", label: "รายการจอง", roles: ["Admin"],
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      href: "/mybookings", label: "รายการจองของฉัน", roles: ["Member"],
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
  ];

  const manageLinks = [
    {
      href: "/courts", label: "สนามกีฬา",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M2 9h20M2 15h20M12 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      href: "/sport_type", label: "ประเภทกีฬา",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 3c0 0-4 4-4 9s4 9 4 9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 3c0 0 4 4 4 9s-4 9-4 9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      href: "/timeslots", label: "ช่วงเวลา",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      href: "/roles", label: "ประเภทผู้ใช้",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    },
    {
      href: "/users", label: "จัดการผู้ใช้",
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
  ];

  const managePaths = manageLinks.map((l) => l.href);
  const isManagePath = managePaths.some((p) => pathname.startsWith(p));

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">

      <div className="flex items-center justify-between px-6 h-[52px] border-b border-gray-100">
        <Link
          href={userRole === "Admin" ? "/adminbookings" : "/bookings"}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 bg-[#378ADD] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">BookingSport</span>
        </Link>

        <div className="flex items-center gap-3">

          {userName && (
            <div className="flex items-center gap-2">
              <div style={{ width: 28, height: 28, minWidth: 28, borderRadius: "50%", background: "#1677ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>
                  {userName.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800 leading-tight">{userName}</p>
                <p className={`text-xs leading-tight ${userRole === "Admin" ? "text-blue-500" : "text-green-500"}`}>
                  {userRole}
                </p>
              </div>
            </div>
          )}

          <div className="w-px h-5 bg-gray-100 hidden md:block"/>

          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ออกจากระบบ
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-50"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>

        </div>
      </div>

      <div className="hidden md:flex items-center gap-1 px-6 h-11">

        {allMainLinks
          .filter((link) => link.roles.includes(userRole))
          .map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition h-8 ${
                pathname === link.href
                  ? "bg-blue-50 text-[#1677ff] font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

        {/* Divider */}
        {userRole === "Admin" && (
          <div className="w-px h-5 bg-gray-100 mx-1"/>
        )}

        {userRole === "Admin" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition h-8 cursor-pointer ${
                isManagePath
                  ? "bg-blue-50 text-[#1677ff] font-medium"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              จัดการ
              <svg
                width="11" height="11" viewBox="0 0 24 24" fill="none"
                className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50 py-1">
                {manageLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDropdownOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                      pathname.startsWith(link.href)
                        ? "bg-blue-50 text-[#1677ff] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white flex flex-col">

          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
            <Link
              href={userRole === "Admin" ? "/adminbookings" : "/bookings"}
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <div className="w-7 h-7 bg-[#378ADD] rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-900">BookingSport</span>
            </Link>
            <button onClick={() => setMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {userName && (
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-50">
              <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: "50%", background: "#1677ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>
                  {userName.slice(0, 1).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className={`text-xs ${userRole === "Admin" ? "text-blue-500" : "text-green-500"}`}>{userRole}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col px-4 py-4 gap-1 flex-1 overflow-y-auto">

            {allMainLinks
              .filter((link) => link.roles.includes(userRole))
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition ${
                    pathname === link.href
                      ? "bg-blue-50 text-[#1677ff] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

            {userRole === "Admin" && (
              <>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">จัดการ</p>
                </div>
                {manageLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm transition ${
                      pathname.startsWith(link.href)
                        ? "bg-blue-50 text-[#1677ff] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </>
            )}

          </div>

          <div className="px-4 pb-8 pt-2 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              ออกจากระบบ
            </button>
          </div>

        </div>
      )}

    </nav>
  );
}