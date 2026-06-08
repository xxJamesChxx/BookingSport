"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getData, postData } from "@/lib/api-helper";
import Link from "next/link";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface Court {
    id: number;
    name: string;
    sportTypeName: string;
    pricePerHour: number;
    imageName: string;
    description: string;
}

interface TimeSlot {
    timeSlotId: number;
    startTime: string;
    endTime: string;
    price: number;
    isAvailable: boolean;
    unavailableReason: string;
}

export default function AddBookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courtId = searchParams.get("courtId");

    const [court, setCourt] = useState<Court | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (courtId) {
            setLoading(true);
            fetchCourt();
        }
    }, [courtId]);

    useEffect(() => {
        if (courtId && selectedDate) fetchAvailability();
        else setTimeSlots([]);
    }, [courtId, selectedDate]);

    const fetchCourt = async () => {
        const data = await getData(`/court/${courtId}`);
        if (data?.statusCode === 200) setCourt(data.data);
        setLoading(false);
    };

    const fetchAvailability = async () => {
        setSelectedSlots([]);
        setLoadingSlots(true);
        const dateStr = selectedDate ? selectedDate.format("YYYY-MM-DD") : "";
        const data = await getData(`/court/${courtId}/courtavailable?date=${dateStr}`);
        if (data?.statusCode === 200) setTimeSlots(data.data);
        setLoadingSlots(false);
    };

    const toggleSlot = (slot: TimeSlot) => {
        if (!slot.isAvailable) return;
        const exists = selectedSlots.find((s) => s.timeSlotId === slot.timeSlotId);
        if (exists) {
            setSelectedSlots(selectedSlots.filter((s) => s.timeSlotId !== slot.timeSlotId));
        } else {
            setSelectedSlots([...selectedSlots, slot]);
        }
    };

    const totalPrice = selectedSlots.reduce((sum, s) => sum + s.price, 0);

    const handleSubmit = async () => {
        const resultConfirm = await alertConfirm("question","ยืนยันการจองสนาม?",`คุณต้องการจองสนามจำนวน ${selectedSlots.length} ช่วงเวลา ใช่หรือไม่?`);
        if (!resultConfirm.isConfirmed) return;

        setLoading(true);

        const data = await postData("/booking", {
            courtId: Number(courtId),
            timeSlotIds: selectedSlots.map((s) => s.timeSlotId),
            bookingDate: selectedDate ? selectedDate.format("YYYY-MM-DD") : null,
        });

        setLoading(false);

        if (!data || data.statusCode !== 200) {
            await alert("error","จองไม่สำเร็จ",data?.message || "ไม่สามารถบันทึกข้อมูลได้");
            return;
        }

        const result = await alert("success", "บันทึกสำเร็จ", "เพิ่มสนามกีฬาเรียบร้อยแล้ว");
        if (result.isConfirmed) {
            router.push("/bookings");
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="w-full mx-auto">

                <div className="flex items-center gap-2 mb-5">
                    <Link href="/bookings" className="flex items-center gap-1.5 text-sm text-[#1677ff] hover:text-blue-700">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        จองสนาม
                    </Link>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm text-gray-400">เลือกวันเวลา</span>
                </div>

                <div className="grid grid-cols-1 gap-5">

                    {court && (
                        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm" style={{ width: "100%" }}>

                            {court.imageName ? (
                                <div className="-mx-0">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/images/${court.imageName}`}
                                        alt={court.name}
                                        className="img-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-blue-50 flex items-center justify-center">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="#1677ff" strokeWidth="1.5" />
                                        <path d="M12 3v18M3 12h18" stroke="#1677ff" strokeWidth="1" />
                                    </svg>
                                </div>
                            )}

                            <div className="p-4">
                                <p className="text-sm font-semibold text-gray-800">{court.name}</p>
                                <p className="text-sm font-semibold mt-4">ประเภทกีฬา</p>
                                <p className="text-xs text-gray-400 mt-0.5">{court.sportTypeName}</p>
                                <p className="text-sm font-semibold mt-4">รายละเอียด</p>
                                <p className="text-xs text-gray-400 mt-0.5 text-prewrap">{court.description}</p>
                                <p className="text-sm font-semibold mt-4">ราคา</p>
                                <p className="text-sm font-medium text-[#1677ff] mt-1.5">
                                    {court.pricePerHour?.toLocaleString()} บาท/ชม.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                        <label className="text-sm mb-2 block font-medium">
                            เลือกวันที่จอง <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            placeholder="วัน/เดือน/ปี"
                            format="DD/MM/YYYY"
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            disabledDate={(current) => current && current < dayjs().startOf("day")}
                            className="w-full h-[38px] border-gray-100 bg-gray-50 rounded-lg focus:bg-white"
                        />
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-800">เลือกช่วงเวลา</p>
                                <p className="text-xs text-gray-400 mt-0.5">สามารถเลือกได้หลายช่วงเวลา</p>
                            </div>
                            {selectedSlots.length > 0 && (
                                <button
                                    onClick={() => setSelectedSlots([])}
                                    className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                                >
                                    ล้างที่เลือก
                                </button>
                            )}
                        </div>

                        <div className="p-5">
                            {!selectedDate && (
                                <div className="text-center py-16 text-gray-400">
                                    <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <p className="text-sm">กรุณาเลือกวันที่จองก่อน</p>
                                </div>
                            )}

                            {selectedDate && loadingSlots && (
                                <div className="flex justify-center py-16">
                                    <div className="w-7 h-7 border-2 border-[#1677ff] border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {selectedDate && !loadingSlots && timeSlots.length === 0 && (
                                <div className="text-center py-16 text-gray-400">
                                    <p className="text-sm">ไม่มีช่วงเวลาว่าง</p>
                                </div>
                            )}

                            {selectedDate && !loadingSlots && timeSlots.length > 0 && (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {timeSlots.map((slot) => {
                                            const isSelected = selectedSlots.some((s) => s.timeSlotId === slot.timeSlotId);
                                            const isBooked = slot.unavailableReason === "booked";
                                            return (
                                                <button
                                                    key={slot.timeSlotId}
                                                    onClick={() => toggleSlot(slot)}
                                                    disabled={!slot.isAvailable}
                                                    className={`p-4 rounded-2xl border-2 text-left transition ${!slot.isAvailable
                                                        ? isBooked
                                                            ? "bg-gray-50 border-gray-100 cursor-not-allowed"
                                                            : "bg-red-50 border-red-100 cursor-not-allowed"
                                                        : isSelected
                                                            ? "bg-[#1677ff] border-[#1677ff] cursor-pointer shadow-md"
                                                            : "bg-white border-gray-200 hover:border-[#1677ff] cursor-pointer hover:shadow-sm"
                                                        }`}
                                                >
                                                    <p className={`text-center font-bold ${!slot.isAvailable
                                                        ? isBooked ? "text-gray-300" : "text-red-300"
                                                        : isSelected ? "text-white" : "text-gray-800"
                                                        }`}>
                                                        {slot.startTime}–{slot.endTime}
                                                    </p>
                                                    {/* <div className={`w-full h-px my-2 ${!slot.isAvailable
                                                            ? isBooked ? "bg-gray-100" : "bg-red-100"
                                                            : isSelected ? "bg-blue-400" : "bg-gray-100"
                                                        }`} /> */}
                                                    {!slot.isAvailable && (
                                                        <p className={`text-sm text-center font-semibold ${isBooked ? "text-gray-300" : "text-red-500"
                                                            }`}>
                                                            {isBooked ? "จองแล้ว" : "หมดเวลาจอง"}
                                                        </p>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedSlots.length > 0 && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-medium text-gray-500 mb-3">สรุปการจอง</p>
                            <div className="flex flex-col gap-1.5 text-sm">
                                <p className="text-gray-700">สนาม: <span className="font-medium">{court?.name}</span></p>
                                <p className="text-gray-700">วันที่: <span className="font-medium">{selectedDate ? selectedDate.format("DD/MM/YYYY") : ""}</span></p>
                                <p className="text-gray-700">จำนวน: <span className="font-medium">{selectedSlots.length} ช่วงเวลา</span></p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedSlots.map((s) => (
                                        <span key={s.timeSlotId} className="bg-white border border-blue-200 text-[#1677ff] text-xs px-2 py-0.5 rounded-lg">
                                            {s.startTime}–{s.endTime}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-base font-bold text-[#1677ff] mt-2 pt-2 border-t border-blue-200">
                                    ฿{totalPrice.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center gap-3 pt-2 w-full">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || selectedSlots.length === 0}
                            className="flex items-center gap-1.5 bg-[#1677ff] text-white px-8 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M17 21v-8H7v8M7 3v5h8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {loading ? "กำลังจอง..." : `ยืนยันการจอง`}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/bookings")}
                            className="flex items-center gap-1.5 text-red-500 border border-red-400 bg-white px-8 py-2.5 rounded-lg text-sm hover:bg-red-50 cursor-pointer whitespace-nowrap"
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
    );
}