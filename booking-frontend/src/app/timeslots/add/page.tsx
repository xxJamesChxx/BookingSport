"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { postData } from "@/lib/api-helper";
import Link from "next/link";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";

export default function EditTimeSlotPage() {
  const router = useRouter();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isActive, setIsActive] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!startTime) {
      await alert("warning","กรุณาระบุ เวลาเริ่มต้น");
      return;
    }

    if (!endTime) {
      await alert("warning","กรุณาระบุ เวลาสิ้นสุด");
      return;
    }

    if (endTime <= startTime) {
      await alert("warning","เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
      return;
    }

    setLoading(true);
    const data = await postData(`/timeslot`, {
      startTime,
      endTime,
      isActive,
    });
    setLoading(false);

    if (!data || data.statusCode !== 200) {
      await alert("error","บันทึกข้อมูลไม่สำเร็จ",data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      return;
    }

    const result = await alert("success", "บันทึกสำเร็จ", "เพิ่มช่วงเวลาเรียบร้อยแล้ว");
    if (result.isConfirmed) {
      router.push("/timeslots");
    }
  };

  const handleCancel = async () => {
    const result = await alertConfirm("question","ยืนยันการยกเลิก","คุณต้องการยกเลิกการแก้ไขข้อมูลใช่ไหม?");
    if (result.isConfirmed) router.push("/timeslots");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">

        <div className="flex items-center gap-2 mb-5">
          <Link
            href="/timeslots"
            className="flex items-center gap-1.5 text-sm text-[#1677ff] hover:text-blue-700"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            ช่วงเวลา
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-gray-400">เพิ่มช่วงเวลา</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-base font-medium text-gray-800">เพิ่มช่วงเวลา</p>
            <p className="text-xs text-gray-400 mt-1">กรอกข้อมูลช่วงเวลา</p>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col gap-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    เวลาเริ่มต้น
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    เวลาสิ้นสุด
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
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