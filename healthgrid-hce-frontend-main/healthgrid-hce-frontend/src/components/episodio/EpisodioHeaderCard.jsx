
import { FiCheckCircle } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import { formatearFechaLarga } from '../../utils/helpers';

/**
 * EpisodioHeaderCard renderiza el panel superior de detalles del episodio:
 * número, tipo, estado (abierto/cerrado), fechas de apertura/alta y acciones
 * rápidas como Dar de Alta o Solicitar Internación.
 */
const EpisodioHeaderCard = ({
  episodio,
  camaActual = null,
  onDarDeAlta,
  onSolicitudCamaClick,
  labelSolicitudCama = 'Solicitar Internación',
  esTurnoActivo,
  onTerminarConsultaClick,
}) => {
  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
  const esInternado = episodio.tipoEpisodio === 'internado' || !!camaActual;

  return (
    <div className="ep-detalle__card">
      <div className="ep-detalle__card-left">
        <div className="ep-detalle__titulo-row">
          <h2 className="ep-detalle__titulo">Episodio #{episodio.numero}</h2>
          <span
            className={`ep-detalle__tipo-badge ${
              esInternado ? 'ep-detalle__tipo-badge--internado' : 'ep-detalle__tipo-badge--ambulatorio'
            }`}
          >
            {esInternado ? 'Internado' : 'Ambulatorio'}
          </span>
          <span
            className={`ep-detalle__estado-badge ${
              esAbierto ? 'ep-detalle__estado-badge--abierto' : 'ep-detalle__estado-badge--cerrado'
            }`}
          >
            {esAbierto ? '● Abierto' : 'Cerrado'}
          </span>
        </div>
        <p className="ep-detalle__fecha">
          {esAbierto
            ? `Desde ${formatearFechaLarga(episodio.fechaApertura || episodio.fecha)} — En curso`
            : `${formatearFechaLarga(episodio.fechaApertura || episodio.fecha)} → Alta: ${formatearFechaLarga(
                episodio.fechaAlta
              )}`}
        </p>
        {camaActual && (camaActual.cama || camaActual.sector) && (
          <p
            className="ep-detalle__fecha"
            style={{ color: '#1E8449', fontWeight: 600, marginTop: '4px' }}
          >
            <FaBed style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Internado en: {camaActual.cama || 'Cama s/n'}
            {camaActual.habitacion ? ` · ${camaActual.habitacion}` : ''}
            {camaActual.sector ? ` · ${camaActual.sector}` : ''}
          </p>
        )}
      </div>
      <div className="ep-detalle__card-right">
        {esAbierto && (
          <>
            {esTurnoActivo && (
              <button className="ep-detalle__btn ep-detalle__btn--terminar" onClick={onTerminarConsultaClick}>
                <FiCheckCircle
                  style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }}
                />{' '}
                Terminar Consulta
              </button>
            )}
            <button className="ep-detalle__btn ep-detalle__btn--alta" onClick={onDarDeAlta}>
              <FiCheckCircle
                style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }}
              />{' '}
              Dar de Alta
            </button>
            <button
              className="ep-detalle__btn ep-detalle__btn--solicitar"
              onClick={onSolicitudCamaClick}
            >
              <FaBed
                style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }}
              />{' '}
              {labelSolicitudCama}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EpisodioHeaderCard;
