"use client";
import { useEffect, useState } from "react";
import { getData, putData } from "@/lib/api-helper";
import { Pagination, DatePicker } from "antd";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";
import dayjs from "dayjs";

interface TimeSlotInfo {
  timeSlotId: number;
  startTime: string;
  endTime: string;
}

interface Booking {
  id: number;
  bookingNo: string;
  courtName: string;
  userEmail: string;
  timeSlots: TimeSlotInfo[];
  bookingDate: string;
  totalPrice: number;
  status: number;
  statusName: string;
  createdDate: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [bookingDate, setBookingDate] = useState<dayjs.Dayjs | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchBookings();
  }, [page, pageSize]);

  const fetchBookings = async (overrideBookingDate?: dayjs.Dayjs | null, overrideStatus?: string, overridePage?: number) => {
    setLoading(true);
    const currentStatus = overrideStatus !== undefined ? overrideStatus : status;
    const currentPage = overridePage !== undefined ? overridePage : page;
    const currentBookingDate = overrideBookingDate !== undefined
      ? overrideBookingDate ? overrideBookingDate.format("YYYY-MM-DD") : ""
      : bookingDate ? bookingDate.format("YYYY-MM-DD") : "";
    const data = await getData(
      `/booking?status=${currentStatus}&bookingDate=${currentBookingDate}&page=${currentPage}&pageSize=${pageSize}`
    );
    if (data?.statusCode === 200) {
      setBookings(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    fetchBookings();
  };

  const handleClear = () => {
    setStatus("");
    setBookingDate(null);
    setPage(1);
    fetchBookings(null, "", 1);
  };

  const canCancel = (booking: Booking) => {
    if (booking.status === 2) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = booking.bookingDate.split("/");
    const bookDate = new Date(
      Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0])
    );
    return bookDate > today;
  };

  const handleCancel = async (id: number) => {
    const resultConfirm = await alertConfirm("warning","ยืนยันการยกเลิก","ต้องการยกเลิกการจองนี้ไหม?");
    if (!resultConfirm.isConfirmed) return;

    const data = await putData(`/booking/${id}/cancel`);
    if (data?.statusCode === 200) {
      const result = await alert("success","ยกเลิกสำเร็จ");
      if (result.isConfirmed) fetchBookings();
    } else {
      await alert("error","เกิดข้อผิดพลาด",data?.message || "ไม่สามารถยกเลิกได้");
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 1)
      return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">Confirmed</span>;
    return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">Cancelled</span>;
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
            <span className="text-sm font-medium text-gray-700">ค้นหาการจอง</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">วันที่จอง</label>
              <DatePicker
                placeholder="วัน/เดือน/ปี"
                format="DD/MM/YYYY"
                value={bookingDate}
                onChange={(date) => setBookingDate(date)}
                className="w-full h-[38px] border-gray-100 bg-gray-50 rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">สถานะ</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="1">Confirmed</option>
                  <option value="2">Cancelled</option>
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

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-sm font-medium text-gray-800">การจองของฉัน</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-[#1677ff]">
                  <th className="text-left px-6 py-3 text-xs font-medium text-white w-12 whitespace-nowrap">เลขที่จอง</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white whitespace-nowrap">สนาม</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white whitespace-nowrap">วันที่จอง</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white whitespace-nowrap">ช่วงเวลา</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white whitespace-nowrap">ราคา</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white whitespace-nowrap">สถานะ</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white whitespace-nowrap">วันที่สร้าง</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-white w-24 whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-sm text-gray-400">
                      ไม่พบการจอง
                    </td>
                  </tr>
                )}

                {bookings.map((booking, index) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-3.5 text-black text-xs">{booking.bookingNo}</td>
                    <td className="px-6 py-3.5 font-medium text-black">{booking.courtName}</td>
                    <td className="px-6 py-3.5 text-black text-xs">{booking.bookingDate}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {booking.timeSlots?.map((slot) => (
                          <span
                            key={slot.timeSlotId}
                            className="text-xs bg-blue-50 text-[#1677ff] border border-blue-100 px-2 py-0.5 rounded-lg"
                          >
                            {slot.startTime}–{slot.endTime}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-black">{booking.totalPrice?.toLocaleString()} บาท</td>
                    <td className="px-6 py-3.5">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-3.5 text-black text-xs">{booking.createdDate}</td>
                    <td className="px-6 py-3.5 text-center">
                      {canCancel(booking) ? (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="text-xs text-red-500 border border-red-400 bg-white px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer mx-auto"
                        >
                          ยกเลิก
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300"></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-gray-50">
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