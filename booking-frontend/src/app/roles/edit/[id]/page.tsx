"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getData, putData } from "@/lib/api-helper";
import Link from "next/link";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";

export default function EditRolePage() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRole();
  }, []);

  const fetchRole = async () => {
    const data = await getData(`/role/${id}`);
    if (data?.statusCode === 200) {
      setName(data.data.name);
      setIsActive(data.data.isActive);
    } else {
      const result = await alert("error", "ไม่พบข้อมูล", "ไม่พบประเภทกีฬาที่ต้องการแก้ไข");
      if (result.isConfirmed) {
        router.push("/roles");
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      await alert("warning", "กรุณาระบุ ชื่อประเภทผู้ใช้งาน");
      return;
    }

    setLoading(true);
    const data = await putData(`/role/${id}`, { name, isActive });
    setLoading(false);

    if (!data || data.statusCode !== 200) {
      await alert("error", "บันทึกข้อมูลไม่สำเร็จ", data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      return;
    }

    const result = await alert("success", "บันทึกสำเร็จ", "แก้ไขประเภทผู้ใช้งานเรียบร้อยแล้ว");
    if (result.isConfirmed) {
      router.push("/roles");
    }
  };

  const handleCancel = async () => {
    const result = await alertConfirm("question", "ยืนยันการยกเลิก", "คุณต้องการยกเลิกการแก้ไขข้อมูลใช่ไหม?");
    if (result.isConfirmed) router.push("/sport_type");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">

        <div className="flex items-center gap-2 mb-5">
          <Link
            href="/roles"
            className="flex items-center gap-1.5 text-sm text-[#1677ff] hover:text-blue-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            ประเภทผู้ใช้งาน
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-gray-400">แก้ไขประเภทผู้ใช้งาน</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-base font-medium text-gray-800">แก้ไขประเภทผู้ใช้งาน</p>
            <p className="text-xs text-gray-400 mt-1">แก้ไขข้อมูลประเภทผู้ใช้งาน</p>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col gap-5">

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  ชื่อประเภทผู้ใช้งาน
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="กรอกชื่อประเภทผู้ใช้งาน"
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  สถานะ
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={isActive === 1}
                      onChange={() => setIsActive(1)}
                      className="w-4 h-4 accent-[#1677ff] cursor-pointer"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={isActive === 0}
                      onChange={() => setIsActive(0)}
                      className="w-4 h-4 accent-[#1677ff] cursor-pointer"
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-[#1677ff] text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M17 21v-8H7v8M7 3v5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {loading ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 text-red-500 border border-red-400 bg-white px-8 py-2.5 rounded-lg text-sm hover:bg-red-50 cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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