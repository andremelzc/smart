import React from "react";
import HostNavbar from "@/src/components/layout/HostNavbar";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Host Navigation */}
      <HostNavbar />
      
      {/* Content */}
      <main>{children}</main>
    </div>
  );
}