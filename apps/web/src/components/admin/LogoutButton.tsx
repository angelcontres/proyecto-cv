"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-[2px] border border-transparent px-3 py-2 text-xs font-medium tracking-[0.12em] text-[#958f87] uppercase transition hover:border-[#ce5e32] hover:text-[#ce5e32]"
    >
      <LogOut className="h-3.5 w-3.5" />
      Cerrar sesión
    </button>
  );
}
