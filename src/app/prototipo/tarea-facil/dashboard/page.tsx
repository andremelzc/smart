import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirigir automáticamente a tarea-facil como vista predeterminada
  redirect('/prototipo/tarea-facil');
}