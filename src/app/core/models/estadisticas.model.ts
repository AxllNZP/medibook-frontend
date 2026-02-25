export interface EstadisticasResponse {
  // Conteo por estado
  totalCitas: number;
  pendientes: number;
  confirmadas: number;
  finalizadas: number;
  canceladas: number;

  // No-shows
  noShows: number;
  porcentajeNoShow: number;

  // Tiempos
  promedioAnticiapacionDias: number;

  // Distribución por hora: { "8": 3, "9": 5, ... }
  citasPorHora: { [hora: string]: number };

  // Distribución por día: { "lunes": 4, "martes": 2, ... }
  citasPorDiaSemana: { [dia: string]: number };
}