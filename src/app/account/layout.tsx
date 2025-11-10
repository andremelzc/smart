import React from "react";

import AccountNavbar from "@/src/components/layout/AccountNavbar";

import AccountSidebar from "@/src/components/layout/AccountSidebar";



export default function AccountLayout({

  children,

}: {

  children: React.ReactNode;

}) {

  return (

    <div className="h-screen flex flex-col bg-gray-50">

      {/* Account Navigation - Fijo arriba */}

      <AccountNavbar />



      {/* Main Container - Ocupa el resto de la altura */}

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar - Fijo a la izquierda con scroll interno si es necesario */}

        <div className="flex-shrink-0">

          <AccountSidebar />

        </div>



        {/* Content - Scroll independiente */}

        <main className="flex-1 overflow-y-auto bg-white">

          <div className="p-8">

            <div className="max-w-7xl mx-auto">{children}</div>

          </div>

        </main>

      </div>

    </div>

  );

}

