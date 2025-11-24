/**
 * Función para formatear nombres propios
 * Convierte "ANDRE MELENDEZ" a "Andre Melendez"
 * @param name - Nombre a formatear
 * @returns Nombre formateado con la primera letra de cada palabra en mayúscula
 */
export function formatName(name: string | null | undefined): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .toLowerCase() // Convierte todo a minúsculas
    .split(" ") // Separa por espacios
    .map((word) => {
      if (word.length === 0) return word;
      // Primera letra mayúscula, resto minúsculas
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" "); // Une con espacios
}

/**
 * Función para formatear nombres completos (nombre + apellido)
 * @param firstName - Primer nombre
 * @param lastName - Apellido
 * @returns Nombre completo formateado
 */
export function formatFullName(
  firstName: string | null,
  lastName: string | null
): string {
  const formattedFirst = formatName(firstName);
  const formattedLast = formatName(lastName);

  return `${formattedFirst} ${formattedLast}`.trim();
}

/**
 * Función para obtener las iniciales de un nombre
 * @param name - Nombre completo
 * @returns Iniciales (máximo 2 caracteres)
 */
export function getNameInitials(name: string | null | undefined): string {
  if (!name || typeof name !== "string") {
    return "U";
  }

  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);

  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();

  // Tomar primera letra del primer y último nombre
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}
