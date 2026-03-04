export interface ReservaResponse {
  idReserva: number;
  codigoReserva: string;
  idParqueadero: number;
  idVehiculo: number;
  idConductor: number;
  fechaHoraInicio: string; // viene ISO con Z
  fechaHoraFin: string;    // viene ISO con Z
  totalEstimado: number;
  estado: 'CONFIRMADA' | 'PENDIENTE' | string;
  urlComprobante?: string;
  fechaCreacion: string;
}