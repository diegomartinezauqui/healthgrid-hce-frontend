
import { FiClipboard, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { formatearFechaLarga } from '../../utils/helpers';
import Swal from 'sweetalert2';

/**
 * PacienteEpisodiosTab renderiza el listado de episodios clínicos asociados al paciente,
 * sus tipos, badges de estado, estadísticas y el botón de creación de episodios.
 */
const PacienteEpisodiosTab = ({
  episodios = [],
  onAbrirEpisodio,
  onNuevoEpisodioClick,
  pacienteYaAtendido = false,
}) => {
  return (
    <div className="episodios-section">
      <div className="episodios-header">
        <div>
          <h2 className="episodios-header__titulo">Episodios Médicos</h2>
          <p className="episodios-header__subtitulo">Historial de interacciones clínicas del paciente</p>
        </div>
        {(() => {
        const tieneEpisodioAbierto = episodios.some(e => e.estado === 'abierto');
        const bloqueado = pacienteYaAtendido || tieneEpisodioAbierto;
          return (
            <button
              className={`detalle-btn detalle-btn--nuevo ${bloqueado ? 'detalle-btn--deshabilitado' : ''}`}
              onClick={() => {
                if (pacienteYaAtendido) {
                  Swal.fire({
                    icon: 'info',
                    title: 'Paciente ya atendido',
                    html: `<p style="margin:0;font-size:0.95rem;color:#555">Este paciente ya fue <strong>atendido</strong> en la consulta de hoy.<br/>No se pueden abrir nuevos episodios para este turno.</p>
                           <p style="margin:12px 0 0 0;font-size:0.85rem;color:#888">Si necesita continuar la atención, debe generarse un nuevo turno.</p>`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#259A5E',
                    timer: 6000,
                    timerProgressBar: true,
                    showCloseButton: true,
                  });
                } else if (tieneEpisodioAbierto) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Episodio ya abierto',
                    html: `<p style="margin:0;font-size:0.95rem;color:#555">El paciente ya tiene un episodio clínico <strong>abierto</strong>.<br/>Solo puede haber un episodio abierto a la vez.</p>
                           <p style="margin:12px 0 0 0;font-size:0.85rem;color:#888">Cerrá el episodio actual antes de abrir uno nuevo.</p>`,
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#259A5E',
                    timer: 6000,
                    timerProgressBar: true,
                    showCloseButton: true,
                  });
                } else {
                  onNuevoEpisodioClick();
                }
              }}
              title={pacienteYaAtendido ? "El paciente ya fue atendido en este turno" : tieneEpisodioAbierto ? "El paciente ya posee un episodio clínico abierto" : "Crear un nuevo episodio clínico"}
            >
              + Nuevo Episodio
            </button>
          );
        })()}
      </div>


      <div className="episodios-lista">
        {episodios.length > 0 ? (
          episodios.map((ep, i) => {
            const esAbierto = ep.estado === 'abierto';
            const esInternado = ep.tipoEpisodio === 'internado';
            const numEvol = ep.cantEvoluciones !== undefined && (ep.evolucionesData?.length || 0) === 0 ? ep.cantEvoluciones : (ep.evolucionesData?.length || 0);
            const numRecetas = ep.cantRecetas !== undefined && (ep.recetasData?.length || 0) === 0 ? ep.cantRecetas : (ep.recetasData?.length || 0);
            const numEstudios = ep.cantEstudios !== undefined && (ep.estudiosData?.length || 0) === 0 ? ep.cantEstudios : (ep.estudiosData?.length || 0);
            return (
              <div
                key={ep.id || i}
                className="episodio-item"
                onClick={() => onAbrirEpisodio(i)}
              >
                <div
                  className={`episodio-item__icono ${
                    esAbierto
                      ? 'episodio-item__icono--abierto'
                      : 'episodio-item__icono--cerrado'
                  }`}
                >
                  {esAbierto
                    ? <FiCircle size={20} style={{ color: '#9EAAA3' }} />
                    : <FiCheckCircle size={20} style={{ color: '#259A5E' }} />}
                </div>
                <div className="episodio-item__info">
                  <div className="episodio-item__titulo-row">
                    <span className="episodio-item__titulo">
                      Episodio #{ep.numero}{ep.diagnosticoPrincipal ? ` — ${ep.diagnosticoPrincipal}` : ''}
                    </span>
                    <span
                      className={`episodio-item__tipo-badge ${
                        esInternado
                          ? 'episodio-item__tipo-badge--internado'
                          : 'episodio-item__tipo-badge--ambulatorio'
                      }`}
                    >
                      {esInternado ? 'Internado' : 'Ambulatorio'}
                    </span>
                    <span
                      className={`episodio-item__estado-badge ${
                        esAbierto
                          ? 'episodio-item__estado-badge--abierto'
                          : 'episodio-item__estado-badge--cerrado'
                      }`}
                    >
                      {esAbierto ? '● Abierto' : 'Cerrado'}
                    </span>
                  </div>
                  <div className="episodio-item__detalle">
                    {esAbierto
                      ? `Desde ${formatearFechaLarga(ep.fechaApertura)} — En curso`
                      : `${formatearFechaLarga(ep.fechaApertura)} → Alta: ${formatearFechaLarga(
                          ep.fechaAlta
                        )}`}
                  </div>
                  {ep.motivo && <div className="episodio-item__motivo">{ep.motivo}</div>}
                </div>
                <div className="episodio-item__stats">
                  <div className="episodio-item__stat">
                    <span className="episodio-item__stat-num">{numEvol}</span>
                    <span className="episodio-item__stat-label">EVOL.</span>
                  </div>
                  <div className="episodio-item__stat">
                    <span className="episodio-item__stat-num">{numRecetas}</span>
                    <span className="episodio-item__stat-label">RECETAS</span>
                  </div>
                  <div className="episodio-item__stat">
                    <span className="episodio-item__stat-num">{numEstudios}</span>
                    <span className="episodio-item__stat-label">ESTUDIOS</span>
                  </div>
                </div>
                <div className="episodio-item__arrow">›</div>
              </div>
            );
          })
        ) : (
          <div className="episodios-vacio">
            <div className="episodios-vacio__icono">
              <FiClipboard size={32} />
            </div>
            <p className="episodios-vacio__texto">No hay episodios registrados para este paciente.</p>
            <p className="episodios-vacio__subtexto">
              Cree el primer episodio clínico para comenzar el seguimiento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PacienteEpisodiosTab;
