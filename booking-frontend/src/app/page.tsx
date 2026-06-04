import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");
  const role = cookieStore.get("roleName");

  if (!token) redirect("/login");

  if (role?.value === "Admin") redirect("/adminbookings");

  redirect("/bookings");
}