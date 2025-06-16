// Función para formatear fecha YYYY-MM-DD a DD/MM/YYYY
export function formaDateLatam(fecha) {
  if (!fecha || typeof fecha !== 'string') return null;

  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;

  const [year, month, day] = partes;
  if (!year || !month || !day) return fecha;

  return `${day}/${month}/${year}`;
}
