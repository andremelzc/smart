import { redirect } from "next/navigation";

export default function AccountPage() {
  // Redirigir automáticamente a /account/profile
  redirect("/account/profile");
}