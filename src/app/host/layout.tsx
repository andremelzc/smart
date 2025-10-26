import React from "react";
import HostNavbar from "@/src/components/layout/HostNavbar";
import HostSidebar from "@/src/components/layout/HostSidebar";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Host Navigation */}
      <HostNavbar />

      {/* Main Container */}
      <div className="flex mx-auto max-w-7xl bg-white shadow-sm">
        {/* Sidebar */}
        <HostSidebar />

        {/* Content */}
        <main className="flex-1 p-8 bg-white">
          <div className="max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}