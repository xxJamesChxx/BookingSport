import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";

export const alert = (icon: string, title: string, text?: string) => {
  return Swal.fire({
    icon: icon as SweetAlertIcon,
    title: title,
    text: text,
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#1677ff",
  });
};

export const alertConfirm = (
  icon: string,
  title: string,
  text: string
): Promise<SweetAlertResult> => {
  return Swal.fire({
    icon: icon as SweetAlertIcon,
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: "ใช่",
    cancelButtonText: "ไม่ใช่",
    confirmButtonColor: "#1677ff",
    cancelButtonColor: "#ff4d4f",
  });
};