import React from "react";
import HostNavbar from "@/src/components/layout/HostNavbar";
import HostSidebar from "@/src/components/layout/HostSidebar";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Host Navigation - Fijo arriba */}
      <HostNavbar />

      {/* Main Container - Ocupa el resto de la altura */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fijo a la izquierda con scroll interno si es necesario */}
        <div className="flex-shrink-0">
          <HostSidebar />
        </div>

        {/* Content - Scroll independiente */}
        <main className="flex-1 overflow-y-auto bg-white">
          <div className="p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}