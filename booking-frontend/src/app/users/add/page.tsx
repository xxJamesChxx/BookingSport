"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getData, postData } from "@/lib/api-helper";
import Link from "next/link";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";

interface Role {
  id: number;
  name: string;
}

export default function AddUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    isActive: 1,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const data = await getData("/role?page=1&pageSize=100");
    if (data?.statusCode === 200) setRoles(data.data.items);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      await alert("warning","กรุณาระบุ ชื่อ-นามสกุล");
      return;
    }
    if (!form.email.trim()) {
      await alert("warning","กรุณาระบุ Email");
      return;
    }
    if (!form.password) {
      await alert("warning","กรุณาระบุ Password");
      return;
    }
    if (form.password.length < 8) {
      await alert("warning","Password ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (form.password !== form.confirmPassword) {
      await alert("warning","Password ไม่ตรงกัน");
      return;
    }
    if (!form.role) {
      await alert("warning","กรุณาเลือก ประเภทผู้ใช้งาน");
      return;
    }

    setLoading(true);
    const data = await postData("/auth/register", {
      name: form.name,
      email: form.email,
      password: form.password,
      role: Number(form.role),
      isActive: form.isActive
    });
    setLoading(false);

    if (!data || data.statusCode !== 200) {
      await alert("error","บันทึกข้อมูลไม่สำเร็จ",data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      return;
    }

    const result = await alert("success", "บันทึกสำเร็จ", "เพิ่มผู้ใช้งานเรียบร้อยแล้ว");
    if (result.isConfirmed) {
      router.push("/users");
    }

    router.push("/users");
  };

  const handleCancel = async () => {
    const result = await alertConfirm("question","ยืนยันการยกเลิก","คุณต้องการยกเลิกการแก้ไขข้อมูลใช่ไหม?");
    if (result.isConfirmed) router.push("/users");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <Link href="/users" className="flex items-center gap-1.5 text-sm text-[#1677ff] hover:text-blue-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            ผู้ใช้งาน
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-gray-400">เพิ่มผู้ใช้งาน</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-base font-medium text-gray-800">เพิ่มผู้ใช้งาน</p>
            <p className="text-xs text-gray-400 mt-1">กรอกข้อมูลผู้ใช้งานใหม่</p>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col gap-5">

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="กรอกชื่อ-นามสกุล"
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    ยืนยัน Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="กรอก Password อีกครั้ง"
                      className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-red-300 focus:border-red-400"
                          : "border-gray-200 focus:border-blue-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Password ไม่ตรงกัน</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  ประเภทผู้ใช้งาน <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                  >
                    <option value="">เลือกประเภทผู้ใช้งาน</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={form.isActive === 1}
                      onChange={() => setForm({ ...form, isActive: 1 })}
                      className="w-4 h-4 accent-[#1677ff] cursor-pointer"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={form.isActive === 0}
                      onChange={() => setForm({ ...form, isActive: 0 })}
                      className="w-4 h-4 accent-[#1677ff] cursor-pointer"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-[#1677ff] text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M17 21v-8H7v8M7 3v5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 text-red-500 border border-red-400 bg-white px-8 py-2.5 rounded-lg text-sm hover:bg-red-50 cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  ยกเลิก
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}