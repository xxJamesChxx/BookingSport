"use client";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 p-4">

      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#ff4d4f" strokeWidth="1.5"/>
          <path d="M12 8v4M12 16h.01" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="text-center">
        <p className="text-5xl font-bold text-gray-800 mb-2">403</p>
        <p className="text-lg font-medium text-gray-700 mb-1">ไม่มีสิทธิ์เข้าถึง</p>
        <p className="text-sm text-gray-400">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-[#1677ff] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        กลับหน้าก่อนหน้า
      </button>

    </div>
  );
}