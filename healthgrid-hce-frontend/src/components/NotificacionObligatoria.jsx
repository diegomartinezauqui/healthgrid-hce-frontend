// src/components/NotificacionObligatoria.jsx
import React, { useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import '../styles/NotificacionObligatoria.css';

/**
 * Toast de confirmación que se muestra cuando el sistema detecta una patología
 * de notificación obligatoria y emite el evento asincrónico a Epidemiología.
 *
 * @param {object}   patologia     - patología detectada (nombre, modalidad...).
 * @param {object}   evento        - acuse del evento emitido (topic, eventoId).
 * @param {function} onCerrar      - cierra el toast.
 * @param {number}   autoOcultarMs - ms para autocierre (0 = no autocerrar).
 */
const NotificacionObligatoria = ({ patologia, evento, onCerrar, autoOcultarMs = 10000 }) => {
  useEffect(() => {
    if (!autoOcultarMs) return undefined;
    const t = setTimeout(onCerrar, autoOcultarMs);
    return () => clearTimeout(t);
  }, [autoOcultarMs, onCerrar]);

  return (
    <div className="notif-oblig" role="alert" aria-live="assertive">
      <button className="notif-oblig__close" onClick={onCerrar} aria-label="Cerrar notificación">
        <FiX />
      </button>

      <div className="notif-oblig__header">
        <FiAlertTriangle className="notif-oblig__icon" />
        <span className="notif-oblig__titulo">Notificación Obligatoria Emitida</span>
      </div>

      <p className="notif-oblig__texto">
        Se detectó diagnóstico de notificación obligatoria. El sistema ha emitido el evento
        asincrónico al módulo de Epidemiología automáticamente.
      </p>

      {(patologia || evento) && (
        <div className="notif-oblig__detalle">
          {patologia && (
            <span className="notif-oblig__chip">
              {patologia.nombre} · Notif. {patologia.modalidad}
            </span>
          )}
          {evento && (
            <span className="notif-oblig__evento">
              evento <code>{evento.topic}</code> · {evento.eventoId}
            </span>
          )}
        </div>
      )}

      <div className="notif-oblig__actions">
        <button className="notif-oblig__btn" onClick={onCerrar}>Entendido</button>
      </div>
    </div>
  );
};

export default NotificacionObligatoria;
