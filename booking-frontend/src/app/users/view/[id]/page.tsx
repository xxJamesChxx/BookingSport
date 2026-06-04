"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getData } from "@/lib/api-helper";
import Link from "next/link";
import Loading from "@/components/loading";

interface User {
  id: number;
  name: string;
  email: string;
  isActive: number;
  createdDate: string;
  createdUser: string;
  updatedDate: string;
  updatedUser: string;
}

export default function ViewUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const data = await getData(`/user/${id}`);
    if (data?.statusCode === 200) {
      setUser(data.data);
    }
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">

        <div className="flex items-center gap-2 mb-5">
          <Link href="/users" className="flex items-center gap-1.5 text-sm text-[#1677ff] hover:text-blue-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            ผู้ใช้
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="text-sm text-gray-400">รายละเอียดผู้ใช้</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-base font-medium text-gray-800">รายละเอียดผู้ใช้</p>
            </div>
            <button
              onClick={() => router.push(`/users/edit/${id}`)}
              className="flex items-center gap-1.5 bg-[#1677ff] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              แก้ไข
            </button>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col gap-5">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">ชื่อผู้ใช้</p>
                  <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">สถานะ</p>
                  {user?.isActive === 1 ? (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">Active</span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">Inactive</span>
                  )}
                </div>
              </div>

              <div className="border-gray-50">
                <p className="text-xs text-gray-400 mb-3">ข้อมูลการสร้าง</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">วันที่สร้าง</p>
                    <p className="text-sm text-gray-700">{user?.createdDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">สร้างโดย</p>
                    <p className="text-sm text-gray-700">{user?.createdUser || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">วันที่แก้ไขล่าสุด</p>
                    <p className="text-sm text-gray-700">{user?.updatedDate || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">แก้ไขโดย</p>
                    <p className="text-sm text-gray-700">{user?.updatedUser || "—"}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-50 flex justify-center">
            <Link
              href="/users"
              className="flex items-center gap-1.5 text-gray-500 border border-gray-200 bg-white px-8 py-2.5 rounded-lg text-sm hover:bg-gray-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              กลับ
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
