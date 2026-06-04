"use client";
import { useEffect, useState } from "react";
import { getData, deleteData } from "@/lib/api-helper";
import { Pagination } from "antd";
import { useRouter } from "next/navigation";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";

interface Court {
  id: number;
  name: string;
  sportType: number;
  sportTypeName: string;
  pricePerHour: number;
  description: string;
  isActive: number;
  imageName: string;
  createdDate: string;
  createdUser: string;
}

interface SportType {
  id: number;
  name: string;
}

export default function CourtsPage() {
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sportType, setSportType] = useState("");
  const [isActive, setIsActive] = useState("")
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchSportTypes();
    fetchCourts();
  }, [page, pageSize]);

  const fetchSportTypes = async () => {
    const data = await getData("/sporttype?isActive?page=1&pageSize=100");
    if (data?.statusCode === 200) setSportTypes(data.data.items);
  };

  const fetchCourts = async (overrideSearch?: string, overrideSportType?: string, overrideIsActive?: string, overridePage?: number) => {
    setLoading(true);
    const currentSearch = overrideSearch !== undefined ? overrideSearch : search;
    const currentSportType = overrideSportType !== undefined ? overrideSportType : sportType;
    const currentIsActive = overrideIsActive !== undefined ? overrideIsActive : isActive;
    const currentPage = overridePage !== undefined ? overridePage : page;
    const data = await getData(
      `/court?name=${currentSearch}&sportType=${currentSportType}&isActive=${currentIsActive}&page=${currentPage}&pageSize=${pageSize}`
    );
    if (data?.statusCode === 200) {
      setCourts(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchCourts();
  };

  const handleClear = () => {
    setSearch("");
    setSportType("");
    setIsActive("");
    setPage(1);
    fetchCourts("", "", "", 1);
  };

  const handleDelete = async (id: number) => {
    const resultConfirm = await alertConfirm("warning","ยืนยันการลบ","ต้องการลบสนามนี้ไหม?");
    if (!resultConfirm.isConfirmed) return;

    const data = await deleteData(`/court/${id}`);

    if (data?.statusCode === 200) {
      const result = await alert("success","ลบสำเร็จ");
      if (result.isConfirmed) fetchCourts();
    } else {
      await alert("error","ลบไม่สำเร็จ",data?.message || "ไม่สามารถลบข้อมูลได้");
    }
  };

  const getStatusBadge = (isActive: number) => {
    if (isActive === 1)
      return (
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
          Active
        </span>
      );
    return (
      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
        Inactive
      </span>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">

        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="1.5" />
              <path d="M20 20l-3-3" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium text-gray-700">ค้นหาสนาม</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ชื่อสนาม</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="พิมพ์ชื่อสนามที่ต้องการค้นหา"
                autoComplete="off"
                className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ประเภทกีฬา</label>
              <div className="relative">
                <select
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                >
                  <option value="">ทั้งหมด</option>
                  {sportTypes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">สถานะ</label>
              <div className="relative">
                <select
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1">Active</option>
                  <option value="2">InActive</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 px-3 py-2 cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M3 12a9 9 0 109-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ล้างค่า
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-1.5 bg-[#4361ee] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="1.5" />
                <path d="M20 20l-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              ค้นหาข้อมูล
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">รายการสนามในระบบ</p>
            </div>
            <button
              onClick={() => router.push("/courts/add")}
              className="flex items-center gap-1.5 bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg self-start sm:self-auto cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              เพิ่มสนาม
            </button>
          </div>

          <div className="overflow-x-auto px-6 py-4">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-50 bg-[#1677ff]">
                  <th className="text-center px-5 py-3 text-xs font-medium text-white w-12">ลำดับ</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white w-12">รูป</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white">ชื่อสนาม</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white">ประเภทกีฬา</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white">ราคา/ชม.</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white">สถานะ</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white">วันที่สร้าง</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-white w-24">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && courts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-sm text-gray-400">
                      ไม่พบข้อมูลสนาม
                    </td>
                  </tr>
                )}

                {!loading && courts.map((court, index) => (
                  <tr key={court.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5 text-black text-xs text-center">
                      {(page - 1) * pageSize + index + 1}
                    </td>
                    <td className="">
                      {court.imageName ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/images/${court.imageName}`}
                          alt={court.name}
                          className="w-12 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <span className="text-lg">🏟️</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-black">{court.name}</td>
                    <td className="px-5 py-3.5 text-black">{court.sportTypeName}</td>
                    <td className="px-5 py-3.5 text-black">{court.pricePerHour?.toLocaleString()} บาท</td>
                    <td className="px-5 py-3.5 text-center">{getStatusBadge(court.isActive)}</td>
                    <td className="px-5 py-3.5 text-black text-xs">{court.createdDate}</td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`courts/view/${court.id}`)}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-green-50 cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="7" stroke="#4361ee" strokeWidth="1.5" />
                            <path d="M20 20l-3-3" stroke="#4361ee" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          onClick={() => router.push(`/courts/edit/${court.id}`)}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-blue-50 cursor-pointer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#4361ee" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#4361ee" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(court.id)}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-red-50 cursor-pointer"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#ff4d4f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">แสดง</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-gray-100 rounded-lg px-2 py-1 text-xs text-gray-600 outline-none bg-gray-50"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-gray-400">
                รายการ / ทั้งหมด {total} รายการ
              </span>
            </div>

            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
}