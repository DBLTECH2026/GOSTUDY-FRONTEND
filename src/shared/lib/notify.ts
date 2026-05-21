/**
 * Sistema centralizado de notificaciones — wrapper sobre Sonner.
 * Uso:
 *   import { notify } from '@/shared/lib/notify';
 *   notify.success('Docente creado.');
 *   notify.error('No se pudo conectar.');
 *   await notify.promise(crearAlgo(), { loading: 'Creando…', success: 'Listo', error: 'Falló' });
 */

import { toast } from 'sonner';
import { ApiError } from '@/shared/lib/api';

type NotifyMessage = string | { title: string; description?: string };

function unwrap(msg: NotifyMessage) {
  if (typeof msg === 'string') return { message: msg, description: undefined };
  return { message: msg.title, description: msg.description };
}

export const notify = {
  success(msg: NotifyMessage) {
    const { message, description } = unwrap(msg);
    return toast.success(message, { description });
  },

  error(msg: NotifyMessage) {
    const { message, description } = unwrap(msg);
    return toast.error(message, { description });
  },

  warning(msg: NotifyMessage) {
    const { message, description } = unwrap(msg);
    return toast.warning(message, { description });
  },

  info(msg: NotifyMessage) {
    const { message, description } = unwrap(msg);
    return toast.info(message, { description });
  },

  /** Toast persistente con spinner. Devuelve el id para cerrarlo o reemplazarlo. */
  loading(msg: NotifyMessage) {
    const { message, description } = unwrap(msg);
    return toast.loading(message, { description });
  },

  /** Cierra un toast por id (útil cuando usas loading + manualmente success/error). */
  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  /**
   * Auto-maneja una promesa: muestra loading mientras corre y la reemplaza
   * por success/error al resolver/rechazar.
   */
  promise<T>(
    promise: Promise<T>,
    msgs: {
      loading: NotifyMessage;
      success: NotifyMessage | ((value: T) => NotifyMessage);
      error?: NotifyMessage | ((error: unknown) => NotifyMessage);
    },
  ) {
    const loadingTxt = unwrap(msgs.loading);
    return toast.promise(promise, {
      loading: loadingTxt.message,
      success: (value) => {
        const m = typeof msgs.success === 'function' ? msgs.success(value) : msgs.success;
        return unwrap(m).message;
      },
      error: (err) => {
        if (msgs.error) {
          const m = typeof msgs.error === 'function' ? msgs.error(err) : msgs.error;
          return unwrap(m).message;
        }
        return extractApiErrorMessage(err);
      },
    });
  },

  /** Helper común: extrae mensaje de un ApiError o error de red. */
  apiError(err: unknown, fallback = 'Error inesperado.') {
    return notify.error(extractApiErrorMessage(err, fallback));
  },
};

export function extractApiErrorMessage(err: unknown, fallback = 'Error de red.'): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
