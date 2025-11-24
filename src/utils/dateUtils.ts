/**
 * Utilidades para manejo de fechas con workarounds para problemas de timezone
 */

/**
 * Formatea una fecha para mostrar en el frontend
 * WORKAROUND: Suma un día para compensar el problema de timezone
 */
export function formatDateForDisplay(dateString: string | null): string {
  if (!dateString) return "No proporcionado";

  // WORKAROUND: Sumar un día para compensar el problema de timezone
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formatea una fecha para edición en input type="date"
 * WORKAROUND: Suma un día para que el input muestre la fecha correcta
 */
export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return "";

  // WORKAROUND: Sumar un día para compensar el problema de timezone al editar
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);

  return date.toISOString().split("T")[0]; // Formato YYYY-MM-DD
}

/**
 * Convierte una fecha del input a formato ISO para enviar al backend
 */
export function formatDateForBackend(dateString: string): string {
  // El input ya envía en formato YYYY-MM-DD, no necesita transformación
  return dateString;
}

/**
 * Valida si una fecha es válida y no es futura
 */
export function isValidBirthDate(dateString: string): boolean {
  if (!dateString) return false;

  const date = new Date(dateString);
  const today = new Date();

  // Verificar que sea una fecha válida
  if (isNaN(date.getTime())) return false;

  // Verificar que no sea futura
  if (date > today) return false;

  // Verificar que sea después de 1900
  if (date.getFullYear() < 1900) return false;

  return true;
}

/**
 * Calcula la edad basada en la fecha de nacimiento
 */
export function calculateAge(dateString: string | null): number | null {
  if (!dateString) return null;

  const birthDate = new Date(dateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
