
import { FiCalendar, FiCreditCard, FiFileText, FiEdit2, FiPlusCircle } from 'react-icons/fi';
import { calcularEdad, formatearFecha, obtenerIniciales, formatearNumeroHC } from '../../utils/helpers';
import Swal from 'sweetalert2';

/**
 * PacienteHeaderCard renderiza la cabecera principal con información del paciente,
 * su avatar y las acciones rápidas correspondientes a la pestaña activa.
 */
const PacienteHeaderCard = ({
  paciente,
  tabActiva,
  onEditarClick,
  onNuevoEpisodioClick,
  pacienteYaAtendido = false,
}) => {
  if (!paciente) return null;

  const edad = calcularEdad(paciente.fechaNacimiento);
  const iniciales = obtenerIniciales(paciente.nombreApellido);

  return (
    <div className="detalle-paciente-card">
      <div className="detalle-paciente-card__left">
        <div className="detalle-avatar">
          {iniciales}
        </div>
        <div className="detalle-paciente-info">
          <h1 className="detalle-paciente-nombre">
            {paciente.nombreApellido || 'Sin nombre'}
          </h1>
          <div className="detalle-paciente-meta">
            {tabActiva === 'ficha' && (
              <>
                <span className="detalle-meta-item">
                  <FiCalendar style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {edad} años
                </span>
                <span className="detalle-meta-item">
                  {formatearFecha(paciente.fechaNacimiento)}
                </span>
                <span className="detalle-meta-item">
                  <FiCreditCard style={{ marginRight: '4px', verticalAlign: 'middle' }} /> DNI <strong>{paciente.dni || '—'}</strong>
                </span>
                <span className="detalle-meta-item">
                  <FiFileText style={{ marginRight: '4px', verticalAlign: 'middle' }} /> HC <strong>#{formatearNumeroHC(paciente.core_patient_id || paciente.numeroHistoriaClinica)}</strong>
                </span>
                <span className="detalle-meta-badge">● Activo</span>
              </>
            )}
            {tabActiva === 'episodios' && (
              <>
                <span className="detalle-meta-item">
                  <FiCreditCard style={{ marginRight: '4px', verticalAlign: 'middle' }} /> DNI <strong>{paciente.dni || '—'}</strong>
                </span>
                <span className="detalle-meta-item">
                  <FiFileText style={{ marginRight: '4px', verticalAlign: 'middle' }} /> HC <strong>#{formatearNumeroHC(paciente.core_patient_id || paciente.numeroHistoriaClinica)}</strong>
                </span>
                <span className="detalle-meta-badge">● Activo</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Botones solo visibles en tab Ficha Médica */}
      {tabActiva === 'ficha' && (() => {
        const episodios = paciente?.episodios || [];
        const tieneEpisodioAbierto = episodios.some(e => e.estado === 'abierto');
        const bloqueado = pacienteYaAtendido || tieneEpisodioAbierto;
        return (
          <div className="detalle-paciente-card__right">
            <button
              className="detalle-btn detalle-btn--editar"
              onClick={onEditarClick}
            >
              <FiEdit2 className="detalle-btn__icon" /> Actualizar / Editar Ficha
            </button>
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
              <FiPlusCircle className="detalle-btn__icon" /> Nuevo Episodio
            </button>
          </div>
        );
      })()}

    </div>
  );
};

export default PacienteHeaderCard;
