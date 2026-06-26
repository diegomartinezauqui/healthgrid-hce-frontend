
import { FiCalendar, FiCreditCard, FiFileText, FiEdit2, FiPlusCircle } from 'react-icons/fi';
import { calcularEdad, formatearFecha, obtenerIniciales, formatearNumeroHC } from '../../utils/helpers';

/**
 * PacienteHeaderCard renderiza la cabecera principal con información del paciente,
 * su avatar y las acciones rápidas correspondientes a la pestaña activa.
 */
const PacienteHeaderCard = ({
  paciente,
  tabActiva,
  onEditarClick,
  onNuevoEpisodioClick,
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
        return (
          <div className="detalle-paciente-card__right">
            <button
              className="detalle-btn detalle-btn--editar"
              onClick={onEditarClick}
            >
              <FiEdit2 className="detalle-btn__icon" /> Actualizar / Editar Ficha
            </button>
            <button 
              className={`detalle-btn detalle-btn--nuevo ${tieneEpisodioAbierto ? 'detalle-btn--deshabilitado' : ''}`}
              onClick={tieneEpisodioAbierto ? undefined : onNuevoEpisodioClick}
              disabled={tieneEpisodioAbierto}
              title={tieneEpisodioAbierto ? "El paciente ya posee un episodio clínico abierto" : "Crear un nuevo episodio clínico"}
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
