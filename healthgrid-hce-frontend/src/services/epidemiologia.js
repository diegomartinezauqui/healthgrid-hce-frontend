const TOPIC = 'patologia-critica';
const MODULO_DESTINO = 'Epidemiología';

/**
 * Emite el evento de notificación obligatoria.
 * @param {object} payload - datos del caso detectado.
 * @returns {Promise<object>} acuse del evento emitido.
 */
export async function emitirNotificacionObligatoria(payload) {
  
  const evento = {
    eventoId: `EPID-${Date.now()}`,
    topic: TOPIC,
    moduloDestino: MODULO_DESTINO,
    estado: 'emitido',
    timestamp: new Date().toISOString(),
    payload,
  };

  await new Promise((resolve) => setTimeout(resolve, 400));

  console.info(
    `%c[Kafka mock] Evento asincrónico emitido → topic "${TOPIC}" → ${MODULO_DESTINO}`,
    'color:#fff;background:#B23A3A;padding:2px 6px;border-radius:4px;',
    evento
  );

  return evento;
}

export default emitirNotificacionObligatoria;
