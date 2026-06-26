// src/pages/NuevaFichaMedica.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { FiAlertCircle } from 'react-icons/fi';
import { RiAsterisk } from 'react-icons/ri';
import ModalWrapper from '../components/ModalWrapper';
import '../styles/NuevaFichaMedica.css';

const valoresVacios = {
  numeroHistoriaClinica: '',
  grupoSanguineo: '',
  contactoEmergencia: '',
  consideraciones: [{ tipo: '', descripcion: '', detalleReaccion: '' }],
  antecedentes: [{ tipo: '', nombreDescripcion: '', fecha: '', observaciones: '' }],
  observaciones: '',
};

const NuevaFichaMedica = ({ onCerrar, onGuardar, datosIniciales = null, corePatient = null }) => {
  // Si hay datos iniciales (modo edición), usarlos; sino, usar valores vacíos
  const defaultValues = datosIniciales
    ? {
        ...datosIniciales,
        // Asegurar que siempre haya al menos una fila en los arrays
        consideraciones: datosIniciales.consideraciones?.length
          ? datosIniciales.consideraciones
          : [{ tipo: '', descripcion: '', detalleReaccion: '' }],
        antecedentes: datosIniciales.antecedentes?.length
          ? datosIniciales.antecedentes
          : [{ tipo: '', nombreDescripcion: '', fecha: '', observaciones: '' }],
      }
    : valoresVacios;

  const esEdicion = !!datosIniciales;

  // React Hook Form
  const { register, handleSubmit, reset, control, getValues } = useForm({
    defaultValues,
  });

  // Field Arrays dinámicos
  const {
    fields: consideracionFields,
    append: appendConsideracion,
    remove: removeConsideracion,
  } = useFieldArray({ control, name: 'consideraciones' });

  const {
    fields: antecedenteFields,
    append: appendAntecedente,
    remove: removeAntecedente,
  } = useFieldArray({ control, name: 'antecedentes' });

  // Validación manual de campos obligatorios
  const validarCamposObligatorios = (data) => {
    const errores = [];

    // Validar contacto de emergencia (Datos Clínicos Básicos)
    if (!data.contactoEmergencia || data.contactoEmergencia.trim() === '') {
      errores.push('Contacto de Emergencia');
    }

    // Validar consideraciones: al menos una fila debe tener tipo y descripción
    const consideracionesValidas = (data.consideraciones || []).some(
      c => c.tipo && c.tipo.trim() !== '' && c.descripcion && c.descripcion.trim() !== ''
    );
    if (!consideracionesValidas) {
      errores.push('Consideraciones (tipo y descripción)');
    }

    // Validar antecedentes: al menos una fila debe tener tipo y nombre/descripción
    const antecedentesValidos = (data.antecedentes || []).some(
      a => a.tipo && a.tipo.trim() !== '' && a.nombreDescripcion && a.nombreDescripcion.trim() !== ''
    );
    if (!antecedentesValidos) {
      errores.push('Antecedentes (tipo y descripción)');
    }

    return errores;
  };

  // Submit
  const onSubmit = (data) => {
    const errores = validarCamposObligatorios(data);

    if (errores.length > 0) {
      toast.error('Falta rellenar campos obligatorios', {
        description: errores.join(', '),
        icon: <RiAsterisk style={{ color: '#e74c3c', fontSize: '1.1rem' }} />,
        duration: 5000,
        style: {
          borderLeft: '4px solid #e74c3c',
        },
      });
      return;
    }

    if (onGuardar) {
      onGuardar(data);
    } else {
      console.log('Ficha Médica a guardar:', data);
    }
  };

  // Limpiar
  const limpiarFormulario = () => {
    reset(valoresVacios);
  };

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="ficha-overlay"
      modalClassName="ficha-modal"
    >

        {/* Header verde oscuro */}
        <div className="ficha-header">
          <button type="button" className="ficha-header__volver" onClick={onCerrar}>
            ← Volver a Historia Clínica
          </button>
          <h1 className="ficha-header__titulo">
            {esEdicion ? 'Editar Ficha Médica' : 'Nueva Ficha Médica'}
          </h1>
          <p className="ficha-header__descripcion">
            {esEdicion
              ? 'Modifique los datos de la ficha médica del paciente. Los cambios se guardarán al presionar "Guardar Ficha Médica".'
              : 'Formulario para creación y actualización de la ficha médica del paciente. Incluye consideraciones especiales y antecedentes clínicos unificados.'
            }
          </p>
        </div>

        {/* Formulario */}
        <form className="ficha-form" onSubmit={handleSubmit(onSubmit)}>

          {/* ─── SECCIÓN 1: IDENTIFICACIÓN DEL PACIENTE ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">IDENTIFICACIÓN DEL PACIENTE (Datos desde Core)</h2>

            {/* Fila 1: DNI, Nro Historia, Nombre */}
            <div className="ficha-row ficha-row--3cols">
              <div className="ficha-field">
                <label className="ficha-label">DNI</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666' }}>
                  {corePatient?.dni || '—'}
                </div>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Número de Historia Clínica</label>
                <input
                  type="number"
                  placeholder="Ej: 482"
                  className="ficha-input"
                  {...register('numeroHistoriaClinica')}
                />
                <span className="ficha-hint">Tipo: selector numérico.</span>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Nombre y Apellido</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666', fontWeight: 'bold' }}>
                  {corePatient?.nombreApellido || '—'}
                </div>
              </div>
            </div>

            {/* Fila 2: Fecha Nacimiento, Sexo, Teléfono, Domicilio */}
            <div className="ficha-row ficha-row--4cols">
              <div className="ficha-field">
                <label className="ficha-label">Fecha de Nacimiento</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666' }}>
                  {corePatient?.fechaNacimiento || '—'}
                </div>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Sexo</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666' }}>
                  {corePatient?.sexo || '—'}
                </div>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Teléfono</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666' }}>
                  {corePatient?.telefono || '—'}
                </div>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Domicilio</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={corePatient?.direccion}>
                  {corePatient?.direccion || '—'}
                </div>
              </div>
            </div>
          </section>

          {/* ─── SECCIÓN 2: DATOS CLÍNICOS BÁSICOS ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">
              DATOS CLÍNICOS BÁSICOS
              <RiAsterisk className="ficha-required-asterisk" />
            </h2>

            <div className="ficha-row ficha-row--2cols">
              <div className="ficha-field">
                <label className="ficha-label">Grupo Sanguíneo</label>
                <select
                  className="ficha-input ficha-select"
                  {...register('grupoSanguineo')}
                >
                  <option value="">Seleccionar</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
                <span className="ficha-hint">Tipo: lista desplegable.</span>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">
                  Contacto de Emergencia
                  <RiAsterisk className="ficha-required-field-asterisk" />
                </label>
                <input
                  type="text"
                  placeholder="Nombre, parentesco y teléfono"
                  className="ficha-input"
                  {...register('contactoEmergencia')}
                />
                <span className="ficha-hint">Tipo: caja de texto.</span>
              </div>
            </div>
          </section>

          {/* ─── SECCIÓN 3: CONSIDERACIONES (OBLIGATORIO) ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">
              CONSIDERACIONES (OBLIGATORIO)
              <RiAsterisk className="ficha-required-asterisk" />
            </h2>
            <p className="ficha-section__subtitulo">
              Registro de alergias, implantes, condiciones, contraindicaciones, etc.
            </p>

            {consideracionFields.map((field, index) => (
              <div key={field.id} className="ficha-row ficha-row--dynamic">
                <div className="ficha-field ficha-field--dynamic-item">
                  <select
                    className="ficha-input ficha-select"
                    {...register(`consideraciones.${index}.tipo`)}
                  >
                    <option value="">Tipo</option>
                    <option value="alergia">Alergia</option>
                    <option value="implante">Implante</option>
                    <option value="condicion">Condición</option>
                    <option value="contraindicacion">Contraindicación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="ficha-field ficha-field--dynamic-item ficha-field--grow">
                  <input
                    type="text"
                    placeholder="Descripción"
                    className="ficha-input"
                    {...register(`consideraciones.${index}.descripcion`)}
                  />
                </div>
                <div className="ficha-field ficha-field--dynamic-item ficha-field--grow">
                  <input
                    type="text"
                    placeholder="Detalle / Reacción"
                    className="ficha-input"
                    {...register(`consideraciones.${index}.detalleReaccion`)}
                  />
                </div>
                <button
                  type="button"
                  className="ficha-btn-quitar"
                  onClick={() => consideracionFields.length > 1 && removeConsideracion(index)}
                >
                  Quitar
                </button>
              </div>
            ))}

            <button
              type="button"
              className="ficha-btn-agregar"
              onClick={() => appendConsideracion({ tipo: '', descripcion: '', detalleReaccion: '' })}
            >
              + Agregar Consideración
            </button>
          </section>

          {/* ─── SECCIÓN 4: ANTECEDENTES (OBLIGATORIO) ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">
              ANTECEDENTES (OBLIGATORIO)
              <RiAsterisk className="ficha-required-asterisk" />
            </h2>
            <p className="ficha-section__subtitulo">
              Registro de antecedentes quirúrgicos, familiares, patológicos, hábitos e internaciones.
            </p>

            {antecedenteFields.map((field, index) => (
              <div key={field.id} className="ficha-row ficha-row--dynamic">
                <div className="ficha-field ficha-field--dynamic-item">
                  <select
                    className="ficha-input ficha-select"
                    {...register(`antecedentes.${index}.tipo`)}
                  >
                    <option value="">Tipo</option>
                    <option value="quirurgico">Quirúrgico</option>
                    <option value="familiar">Familiar</option>
                    <option value="patologico">Patológico</option>
                    <option value="habito">Hábito</option>
                    <option value="internacion">Internación</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="ficha-field ficha-field--dynamic-item ficha-field--grow">
                  <input
                    type="text"
                    placeholder="Nombre / Descripción"
                    className="ficha-input"
                    {...register(`antecedentes.${index}.nombreDescripcion`)}
                  />
                </div>
                <div className="ficha-field ficha-field--dynamic-item">
                  <input
                    type="date"
                    className="ficha-input"
                    {...register(`antecedentes.${index}.fecha`)}
                  />
                </div>
                <div className="ficha-field ficha-field--dynamic-item ficha-field--grow">
                  <input
                    type="text"
                    placeholder="Observaciones"
                    className="ficha-input"
                    {...register(`antecedentes.${index}.observaciones`)}
                  />
                </div>
                <button
                  type="button"
                  className="ficha-btn-quitar"
                  onClick={() => antecedenteFields.length > 1 && removeAntecedente(index)}
                >
                  Quitar
                </button>
              </div>
            ))}

            <button
              type="button"
              className="ficha-btn-agregar"
              onClick={() => appendAntecedente({ tipo: '', nombreDescripcion: '', fecha: '', observaciones: '' })}
            >
              + Agregar Antecedente
            </button>
          </section>

          {/* ─── SECCIÓN 5: OBSERVACIONES ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">OBSERVACIONES</h2>
            <p className="ficha-section__subtitulo">
              Observaciones generales de la ficha médica
            </p>

            <div className="ficha-row">
              <div className="ficha-field ficha-field--full">
                <textarea
                  placeholder="Notas clínicas, advertencias, indicaciones de seguimiento, etc."
                  className="ficha-textarea"
                  rows={5}
                  {...register('observaciones')}
                />
                <span className="ficha-hint">Tipo: área de texto.</span>
              </div>
            </div>
          </section>

          {/* ─── BOTONES DE ACCIÓN ─── */}
          <div className="ficha-actions">
            <button
              type="button"
              className="ficha-btn ficha-btn--cancelar"
              onClick={onCerrar}
            >
              Cancelar
            </button>
            <div className="ficha-actions__right">
              {!esEdicion && (
                <button
                  type="button"
                  className="ficha-btn ficha-btn--limpiar"
                  onClick={limpiarFormulario}
                >
                  Limpiar formulario
                </button>
              )}
              <button
                type="submit"
                className="ficha-btn ficha-btn--guardar"
              >
                {esEdicion ? 'Guardar Cambios' : 'Guardar Ficha Médica'}
              </button>
            </div>
          </div>

        </form>
    </ModalWrapper>
  );
};

export default NuevaFichaMedica;
