export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Sin navbar - solo el contenido */}
      {children}
    </>
  );
}