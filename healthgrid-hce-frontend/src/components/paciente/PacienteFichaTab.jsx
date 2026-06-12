
import { FiUser, FiActivity, FiAlertTriangle, FiClipboard, FiEdit3 } from 'react-icons/fi';
import { formatearFecha, capitalizarTipo } from '../../utils/helpers';

// Color para tags según tipo
const getTagColor = (tipo) => {
  const colores = {
    alergia: { bg: '#FFF0F0', text: '#CC3333', border: '#FFCCCC', icon: '✕' },
    implante: { bg: '#F0F5FF', text: '#3366AA', border: '#CCE0FF', icon: '⊕' },
    condicion: { bg: '#FFF8E8', text: '#AA7733', border: '#FFEECC', icon: '⚠' },
    contraindicacion: { bg: '#FFF0F0', text: '#CC3333', border: '#FFCCCC', icon: '✕' },
    quirurgico: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9', icon: '' },
    familiar: { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB', icon: '' },
    patologico: { bg: '#FCE4EC', text: '#C62828', border: '#F8BBD0', icon: '' },
    habito: { bg: '#FFF3E0', text: '#E65100', border: '#FFE0B2', icon: '' },
    internacion: { bg: '#F3E5F5', text: '#6A1B9A', border: '#E1BEE7', icon: '' },
    otro: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0', icon: '' },
  };
  return colores[tipo] || colores.otro;
};

/**
 * PacienteFichaTab renderiza la información de la Ficha Médica del paciente:
 * Datos Personales, Resumen Clínico, Consideraciones, Antecedentes y Observaciones.
 */
const PacienteFichaTab = ({ paciente }) => {
  if (!paciente) return null;

  // Extraer alergias para el resumen clínico
  const alergias = (paciente.consideraciones || [])
    .filter(c => c.tipo === 'alergia' && c.descripcion)
    .map(c => c.descripcion);

  return (
    <>
      {/* Fila superior: Datos Personales + Resumen Clínico */}
      <div className="detalle-grid-2cols">
        {/* DATOS PERSONALES */}
        <section className="detalle-card">
          <h2 className="detalle-card__titulo">
            <FiUser className="detalle-card__icono" /> DATOS PERSONALES
          </h2>
          <div className="detalle-datos-lista">
            <div className="detalle-dato">
              <span className="detalle-dato__label">DNI</span>
              <span className="detalle-dato__valor">{paciente.dni || '—'}</span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Nombre y apellido</span>
              <span className="detalle-dato__valor">{paciente.nombreApellido || '—'}</span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Fecha de nacimiento</span>
              <span className="detalle-dato__valor">{formatearFecha(paciente.fechaNacimiento)}</span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Sexo</span>
              <span className="detalle-dato__valor" style={{ textTransform: 'capitalize' }}>
                {paciente.sexo || '—'}
              </span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Nro. de Historia Clínica</span>
              <span className="detalle-dato__valor">{paciente.numeroHistoriaClinica || '—'}</span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Teléfono</span>
              <span className="detalle-dato__valor">{paciente.telefono || '—'}</span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Correo</span>
              <span className="detalle-dato__valor">{paciente.correo || '—'}</span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Domicilio</span>
              <span className="detalle-dato__valor">{paciente.domicilio || '—'}</span>
            </div>
          </div>
        </section>

        {/* RESUMEN CLÍNICO BÁSICO */}
        <section className="detalle-card">
          <h2 className="detalle-card__titulo">
            <FiActivity className="detalle-card__icono" /> RESUMEN CLÍNICO BÁSICO
          </h2>
          <div className="detalle-datos-lista">
            <div className="detalle-dato">
              <span className="detalle-dato__label">Grupo sanguíneo</span>
              <span className="detalle-dato__valor detalle-dato__valor--destacado">
                {paciente.grupoSanguineo || '—'}
              </span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Alergias relevantes</span>
              <span className="detalle-dato__valor detalle-dato__valor--destacado">
                {alergias.length > 0 ? alergias.join(', ') : 'Ninguna registrada'}
              </span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Contacto de emergencia</span>
              <span className="detalle-dato__valor detalle-dato__valor--destacado">
                {paciente.contactoEmergencia || '—'}
              </span>
            </div>
            <div className="detalle-dato">
              <span className="detalle-dato__label">Última consulta</span>
              <span className="detalle-dato__valor detalle-dato__valor--destacado">
                {formatearFecha(paciente.fechaRegistro)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Fila inferior: Consideraciones + Antecedentes */}
      <div className="detalle-grid-2cols">
        {/* CONSIDERACIONES */}
        <section className="detalle-card">
          <h2 className="detalle-card__titulo">
            <FiAlertTriangle className="detalle-card__icono" /> CONSIDERACIONES
          </h2>
          <div className="detalle-tags">
            {(paciente.consideraciones || []).filter(c => c.tipo && c.descripcion).length > 0 ? (
              (paciente.consideraciones || [])
                .filter(c => c.tipo && c.descripcion)
                .map((c, i) => {
                  const color = getTagColor(c.tipo);
                  return (
                    <span
                      key={i}
                      className="detalle-tag"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      {color.icon && <span className="detalle-tag__icon">{color.icon}</span>}
                      {capitalizarTipo(c.tipo)}: {c.descripcion}
                      {c.detalleReaccion ? ` (${c.detalleReaccion})` : ''}
                    </span>
                  );
                })
            ) : (
              <span className="detalle-tag detalle-tag--vacio">Sin consideraciones registradas</span>
            )}
          </div>
        </section>

        {/* ANTECEDENTES */}
        <section className="detalle-card">
          <h2 className="detalle-card__titulo">
            <FiClipboard className="detalle-card__icono" /> ANTECEDENTES
          </h2>
          <div className="detalle-tags">
            {(paciente.antecedentes || []).filter(a => a.tipo && a.nombreDescripcion).length > 0 ? (
              (paciente.antecedentes || [])
                .filter(a => a.tipo && a.nombreDescripcion)
                .map((a, i) => {
                  const color = getTagColor(a.tipo);
                  return (
                    <span
                      key={i}
                      className="detalle-tag"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      {capitalizarTipo(a.tipo)}: {a.nombreDescripcion}
                      {a.fecha ? ` (${formatearFecha(a.fecha)})` : ''}
                    </span>
                  );
                })
            ) : (
              <span className="detalle-tag detalle-tag--vacio">Sin antecedentes registrados</span>
            )}
          </div>
        </section>
      </div>

      {/* OBSERVACIONES */}
      <section className="detalle-card">
        <h2 className="detalle-card__titulo">
          <FiEdit3 className="detalle-card__icono" /> OBSERVACIONES
        </h2>
        <p className="detalle-card__subtitulo">Notas generales</p>
        <div className="detalle-observaciones-box">
          {paciente.observaciones || 'Sin observaciones registradas.'}
        </div>
      </section>
    </>
  );
};

export default PacienteFichaTab;
