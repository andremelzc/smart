import React from "react";
import AccountNavbar from "@/src/components/layout/AccountNavbar";
import AccountSidebar from "@/src/components/layout/AccountSidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Account Navigation */}
      <AccountNavbar />

      {/* Main Container */}
      <div className="flex mx-auto max-w-7xl bg-white shadow-sm">
        {/* Sidebar */}
        <AccountSidebar />

        {/* Content */}
        <main className="flex-1 p-8 bg-white">
          <div className="max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
