import { superadminGuard } from './superadmin.guard';

/**
 * @deprecated Use superadminGuard instead
 * Guard legacy para compatibilidad - ahora redirige a superadminGuard
 * Los productores ahora son manejados por el superadmin (bodegero)
 */
export const producerGuard = superadminGuard;