
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
  onDarDeAlta,
  onSolicitarInternacionClick,
}) => {
  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
  const esInternado = episodio.tipoEpisodio === 'internado';

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
      </div>
      <div className="ep-detalle__card-right">
        {esAbierto && (
          <>
            <button className="ep-detalle__btn ep-detalle__btn--alta" onClick={onDarDeAlta}>
              <FiCheckCircle
                style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }}
              />{' '}
              Dar de Alta
            </button>
            <button
              className="ep-detalle__btn ep-detalle__btn--solicitar"
              onClick={onSolicitarInternacionClick}
            >
              <FaBed
                style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }}
              />{' '}
              Solicitar Internación
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EpisodioHeaderCard;
