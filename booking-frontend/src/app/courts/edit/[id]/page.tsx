"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getData, putForm } from "@/lib/api-helper";
import Link from "next/link";
import { alert, alertConfirm } from "@/lib/alert";
import Loading from "@/components/loading";

interface SportType {
  id: number;
  name: string;
}

export default function EditCourtPage() {
  const router = useRouter();
  const { id } = useParams();
  const [sportTypes, setSportTypes] = useState<SportType[]>([]);
  const [form, setForm] = useState({
    name: "",
    sportType: "",
    pricePerHour: "",
    description: "",
    isActive: 1,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldImageName, setOldImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchSportTypes();
    fetchCourt();
    setLoading(false);
  }, []);

  const fetchSportTypes = async () => {
    const data = await getData("/sporttype?page=1&pageSize=100");
    if (data?.statusCode === 200) setSportTypes(data.data.items);
  };

  const fetchCourt = async () => {
    const data = await getData(`/court/${id}`);
    if (data?.statusCode === 200) {
      const court = data.data;
      setForm({
        name: court.name ?? "",
        sportType: String(court.sportType ?? ""),
        pricePerHour: String(court.pricePerHour ?? ""),
        description: court.description ?? "",
        isActive: court.isActive ?? 1,
      });
      if (court.imageName) {
        setOldImageName(court.imageName);
        setImagePreview(
          `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/images/${court.imageName}`
        );
      }
    } else {
      const result = await alert("error", "ไม่พบข้อมูล", "ไม่พบประเภทกีฬาที่ต้องการแก้ไข");
      if (result.isConfirmed) {
        router.push("/courts");
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const input = document.getElementById("imageInput") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      await alert("warning", "ไฟล์ใหญ่เกินไป", "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      await alert("warning", "กรุณาระบุ ชื่อสนาม");
      return;
    }
    if (!form.sportType) {
      await alert("warning", "กรุณาเลือก ประเภทกีฬา");
      return;
    }
    if (!form.pricePerHour || Number(form.pricePerHour) <= 0) {
      await alert("warning", "กรุณาระบุ ราคาต่อชั่วโมง");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("sportType", form.sportType);
    formData.append("pricePerHour", form.pricePerHour);
    formData.append("description", form.description);
    formData.append("isActive", String(form.isActive));
    if (imageFile) formData.append("file", imageFile);

    const data = await putForm(`/court/${id}`, formData);
    setLoading(false);

    if (!data || data.statusCode !== 200) {
      await alert("error", "บันทึกข้อมูลไม่สำเร็จ", data?.message || "ไม่สามารถบันทึกข้อมูลได้");
      return;
    }

    const result = await alert("success", "บันทึกสำเร็จ", "แก้ไขสนามกีฬาเรียบร้อยแล้ว");
    if (result.isConfirmed) {
      router.push("/courts");
    }
  };

  const handleCancel = async () => {
    const result = await alertConfirm("question", "ยืนยันการยกเลิก", "คุณต้องการยกเลิกการแก้ไขข้อมูลใช่ไหม?");
    if (result.isConfirmed) router.push("/courts");
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full mx-auto">

        <div className="flex items-center gap-2 mb-5">
          <Link href="/courts" className="flex items-center gap-1.5 text-sm text-[#1677ff] hover:text-blue-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            สนามกีฬา
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm text-gray-400">แก้ไขสนามกีฬา</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-base font-medium text-gray-800">แก้ไขสนามกีฬา</p>
            <p className="text-xs text-gray-400 mt-1">แก้ไขข้อมูลสนามกีฬา</p>
          </div>

          <div className="px-6 py-6">
            <div className="flex flex-col gap-5">

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">รูปภาพสนาม</label>
                <div
                  onClick={() => document.getElementById("imageInput")?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1677ff] hover:bg-blue-50 transition"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full max-h-[300px] object-contain rounded-lg bg-gray-50"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <p className="text-sm">คลิกเพื่ออัพโหลดรูปภาพ</p>
                      <p className="text-xs">PNG, JPG ขนาดไม่เกิน 5MB</p>
                    </div>
                  )}
                </div>
                <input
                  id="imageInput"
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="flex justify-start mt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      ลบรูปภาพสนาม
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">
                  ชื่อสนาม <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="กรอกชื่อสนาม"
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    ประเภทกีฬา <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.sportType}
                      onChange={(e) => setForm({ ...form, sportType: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                    >
                      <option value="">เลือกประเภทกีฬา...</option>
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
                  <label className="text-sm text-gray-500 mb-1.5 block">
                    ราคา/ชั่วโมง (฿) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.pricePerHour}
                    onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                    placeholder="0.00"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1.5 block">รายละเอียด</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="กรอกรายละเอียดสนาม..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 resize-none"
                />
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