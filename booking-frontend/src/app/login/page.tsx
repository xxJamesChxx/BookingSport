"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postData, setTokens } from "@/lib/api-helper";
import Loading from "@/components/loading";
import { MdSportsSoccer } from "react-icons/md";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const data = await postData("/auth/login", { email, password });
    
    if (!data || data.statusCode !== 200) {
      if (data?.statusCode === 409) {
        const confirm = window.confirm(data.message);
        if (confirm) await handleForceLogin();
      } else {
        setError(data?.message || "เกิดข้อผิดพลาด");
      }
      setLoading(false);
      return;
    }

    setTokens(data.data.accessToken, data.data.refreshToken, data.data.user.name, data.data.user.roleName);
    const userRole = data.data.user.roleName;
    if (userRole === "Admin") {
      router.push("/adminbookings");
    } else {
      router.push("/bookings");
    }
    setLoading(false);
  };

  const handleForceLogin = async () => {
    const data = await postData(
      "/auth/login",
      { email, password },
      { "X-Force-Login": "true" }
    );

    if (!data || data.statusCode !== 200) {
      setError(data?.message || "เกิดข้อผิดพลาด");
      return;
    }

    setTokens(data.data.accessToken, data.data.refreshToken, data.data.user.name, data.data.user.roleName);
    const userRole = data.data.user.roleName;
    if (userRole === "Admin") {
      router.push("/adminbookings");
    } else {
      router.push("/bookings");
    }
  };

  if (loading) return <Loading />;


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-xl p-7">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-[#378ADD] rounded-lg flex items-center justify-center">
                <MdSportsSoccer size={18} color="white" />
              </div>
              <span className="text-[15px] font-medium text-gray-900">BookingSport</span>
            </div>
            <p className="text-[22px] font-medium text-gray-900 mb-1">ยินดีต้อนรับ</p>
            <p className="text-sm text-gray-500">เข้าสู่ระบบเพื่อจองสนามกีฬา</p>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              maxLength={100}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                maxLength={100}
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>

          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#185FA5] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0C447C] disabled:opacity-50"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="text-[#378ADD] font-medium">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}