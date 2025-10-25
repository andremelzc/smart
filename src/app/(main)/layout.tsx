import Navbar from "@/src/components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="mx-auto w-full max-w-5xl">
        <main className="min-h-screen px-6 py-6">
          {children}
        </main>
      </div>
    </>
  );
}