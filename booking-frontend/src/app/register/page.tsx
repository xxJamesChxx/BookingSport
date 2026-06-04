"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postData } from "@/lib/api-helper";
import Swal from "sweetalert2";
import Loading from "@/components/loading";
import { MdSportsSoccer } from "react-icons/md";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    isActive: 1,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!form.name.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณาระบุ ชื่อ-นามสกุล", confirmButtonColor: "#1677ff" });
      return;
    }
    if (!form.email.trim()) {
      Swal.fire({ icon: "warning", title: "กรุณาระบุ Email", confirmButtonColor: "#1677ff" });
      return;
    }
    if (!form.password) {
      Swal.fire({ icon: "warning", title: "กรุณาระบุ Password", confirmButtonColor: "#1677ff" });
      return;
    }
    if (form.password.length < 8) {
      Swal.fire({ icon: "warning", title: "Password ต้องมีอย่างน้อย 8 ตัวอักษร", confirmButtonColor: "#1677ff" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      Swal.fire({ icon: "warning", title: "Password ไม่ตรงกัน", confirmButtonColor: "#1677ff" });
      return;
    }

    setLoading(true);
    const data = await postData("/auth/register", {
      name: form.name,
      email: form.email,
      password: form.password,
      isActive: form.isActive
    });
    setLoading(false);

    if (!data || data.statusCode !== 200) {
      Swal.fire({
        icon: "error",
        title: "สมัครสมาชิกไม่สำเร็จ",
        text: data?.message || "ไม่สามารถบันทึกข้อมูลได้",
        confirmButtonColor: "#1677ff",
      });
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "สมัครสมาชิกสำเร็จ",
      text: "สมัครสมาชิกเรียบร้อยแล้ว",
      showConfirmButton: false,
      timer: 1500,
    });

    router.push("/login");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#378ADD] rounded-lg flex items-center justify-center">
              <MdSportsSoccer size={18} color="white" />
            </div>
            <span className="text-[15px] font-medium text-gray-900"></span>
          </div>
          <p className="text-[22px] font-medium text-gray-900 mb-1">สร้างบัญชีใหม่</p>
          <p className="text-sm text-gray-500">สมัครฟรี เริ่มจองสนามได้ทันที</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-7">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="mb-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="ระบุ ชื่อ-นามสกุล"
                maxLength={100}
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ระบุ Emaiil"
              maxLength={100}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-1.5">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="ระบุ Password"
                maxLength={100}
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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

          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-1.5">ยืนยัน Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="ระบุ Password อีกครั้ง"
                maxLength={100}
                autoComplete="off"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
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
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#185FA5] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#0C447C] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            มีบัญชีแล้ว?{" "}
            <Link href="/login" className="text-[#378ADD] font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}