import { redirect } from "next/navigation";

export default function AccountPage() {
  // Redirigir automaticamente a /account/profile
  redirect("/account/profile");
}