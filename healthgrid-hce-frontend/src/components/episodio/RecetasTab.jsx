
import { FiFileText, FiPlusCircle } from 'react-icons/fi';
import { formatearFechaLarga, tipoConsultaLabel } from '../../utils/helpers';

/**
 * RecetasTab renderiza el listado de recetas de medicamentos del episodio,
 * su vigencia (vigente/vencido) y las evoluciones asociadas a la prescripción.
 */
const RecetasTab = ({
  recetas = [],
  evoluciones = [],
  esAbierto,
  pacienteIndex,
  episodioIndex,
  onCambiarEstadoReceta,
  onNuevaRecetaClick,
}) => {
  return (
    <div className="ep-detalle__seccion">
      <div className="ep-detalle__seccion-header">
        <div>
          <h3 className="ep-detalle__seccion-titulo">Recetas</h3>
          <p className="ep-detalle__seccion-sub">
            {recetas.length} receta{recetas.length !== 1 ? 's' : ''} en este episodio
          </p>
        </div>
        {esAbierto && (
          <button className="ep-detalle__btn-nueva" onClick={onNuevaRecetaClick}>
            <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Nueva Receta
          </button>
        )}
      </div>

      {/* Lista de recetas */}
      <div className="recetas-lista">
        {recetas.length > 0 ? (
          recetas.map((rec, i) => {
            const esVigente = rec.estado === 'vigente';
            // Find linked evolution info
            const evolVinculada =
              rec.evolucionVinculada !== '' && rec.evolucionVinculada !== undefined
                ? evoluciones[parseInt(rec.evolucionVinculada)]
                : (rec.id_evolucion
                  ? evoluciones.find(e => e.id_evolucion === rec.id_evolucion)
                  : null);

            return (
              <div key={rec.id || i} className="receta-card">
                {/* Header de la receta */}
                <div className="receta-card__header">
                  <div className="receta-card__header-left">
                    <span className="receta-card__numero">RECETA #{rec.numero}</span>
                    <span className="receta-card__fecha">{formatearFechaLarga(rec.fecha)}</span>
                  </div>
                  <span
                    className={`receta-card__estado ${
                      esVigente ? 'receta-card__estado--vigente' : 'receta-card__estado--vencida'
                    }`}
                  >
                    {esVigente ? 'Vigente' : 'Vencida'}
                  </span>
                </div>

                {/* Lista de medicamentos */}
                <div className="receta-card__medicamentos">
                  {(rec.medicamentos || [])
                    .filter((m) => m.nombre)
                    .map((med, mi) => (
                      <div key={mi} className="receta-card__medicamento">
                        <div className="receta-card__med-icon">✓</div>
                        <div className="receta-card__med-info">
                          <span className="receta-card__med-nombre">
                            {med.nombre}
                            {med.cantidad && med.cantidad > 1 && (
                              <span style={{ marginLeft: '6px', padding: '2px 6px', backgroundColor: '#E8F5E9', color: '#2E7D32', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold', display: 'inline-block', verticalAlign: 'middle' }}>
                                x{med.cantidad}
                              </span>
                            )}
                          </span>
                          {med.indicaciones && (
                            <span className="receta-card__med-indicacion">{med.indicaciones}</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Observaciones */}
                {rec.observaciones && (
                  <div className="receta-card__observaciones">
                    <strong>Observaciones:</strong> {rec.observaciones}
                  </div>
                )}

                {/* Footer: evolución vinculada + cambiar estado */}
                <div className="receta-card__footer">
                  <div className="receta-card__footer-left">
                    {evolVinculada && (
                      <span className="receta-card__evol-link">
                        ◇ Evolución #{evolVinculada.numero} —{' '}
                        {tipoConsultaLabel(evolVinculada.tipoConsulta)}
                      </span>
                    )}
                  </div>
                  {import.meta.env.VITE_USE_MOCKS === 'true' && (
                    <button
                      className="receta-card__btn-estado"
                      onClick={() => onCambiarEstadoReceta(pacienteIndex, episodioIndex, i)}
                    >
                      Cambiar estado
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="ep-detalle__vacio">
            <FiFileText size={36} className="ep-detalle__vacio-icono" />
            <p>No hay recetas registradas en este episodio.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              Aquí podrá ver las prescripciones médicas indicadas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecetasTab;
