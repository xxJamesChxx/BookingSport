"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getData } from "@/lib/api-helper";
import { Pagination } from "antd";
import Loading from "@/components/loading";

interface Court {
  id: number;
  name: string;
  sportTypeName: string;
  pricePerHour: number;
  imageName: string;
  isActive: number;
}

interface SportType {
  id: number;
  name: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sportType, setSportType] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchSportTypes();
    fetchCourts();
  }, [page]);

  const fetchSportTypes = async () => {
    const data = await getData("/sporttype?page=1&pageSize=100&isActive=1");
    if (data?.statusCode === 200) setSportTypes(data.data.items);
  };

  const fetchCourts = async (overrideSearch?: string, overrideSportType?: string, overridePage?: number) => {
    setLoading(true);
    const currentSearch = overrideSearch !== undefined ? overrideSearch : search;
    const currentSportType = overrideSportType !== undefined ? overrideSportType : sportType;
    const currentPage = overridePage !== undefined ? overridePage : page;
    const data = await getData(
      `/court?name=${currentSearch}&sportType=${currentSportType}&isActive=1&page=${currentPage}&pageSize=${pageSize}`
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
    setPage(1);
    fetchCourts("","",1);
  };


  const getCourtIcon = (sportTypeName: string) => {
    if (sportTypeName?.includes("แบด") || sportTypeName?.includes("เทนนิส")) {
      return (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#1677ff" strokeWidth="1.5" />
          <path d="M12 3v18M3 12h18" stroke="#1677ff" strokeWidth="1" />
        </svg>
      );
    }
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#389e0d" strokeWidth="1.5" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke="#389e0d" strokeWidth="1" />
      </svg>
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
              className="flex items-center gap-1.5 bg-[#1677ff] text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="1.5" />
                <path d="M20 20l-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              ค้นหาข้อมูล
            </button>
          </div>
        </div>

        {!loading && courts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏟️</p>
            <p className="text-sm">ไม่พบสนามที่ค้นหา</p>
          </div>
        )}

        {!loading && courts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
            {courts.map((court) => (
              <div
                key={court.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#1677ff] hover:shadow-sm transition cursor-pointer"
              >
                <div className={`h-[200px] overflow-hidden`}>
                  {court.imageName ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/images/${court.imageName}`}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getCourtIcon(court.sportTypeName)
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">{court.name}</p>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{court.sportTypeName}</p>
                  <p className="text-base font-semibold text-[#1677ff] mb-3">
                    {court.pricePerHour?.toLocaleString()} บาท/ชม.
                  </p>
                  <button
                    onClick={() => router.push(`/bookings/add?courtId=${court.id}`)}
                    className="w-full bg-[#1677ff] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-blue-600 cursor-pointer"
                  >
                    จองสนาม
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              แสดง {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} จาก {total} รายการ
            </p>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}

      </div>
    </div>
  );
}