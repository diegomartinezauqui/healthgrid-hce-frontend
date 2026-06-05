// src/pages/NuevaFichaMedica.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import '../styles/NuevaFichaMedica.css';

const valoresVacios = {
  dni: '',
  numeroHistoriaClinica: '',
  nombreApellido: '',
  fechaNacimiento: '',
  sexo: '',
  telefono: '',
  correo: '',
  domicilio: '',
  grupoSanguineo: '',
  contactoEmergencia: '',
  consideraciones: [{ tipo: '', descripcion: '', detalleReaccion: '' }],
  antecedentes: [{ tipo: '', nombreDescripcion: '', fecha: '', observaciones: '' }],
  observaciones: '',
};

const NuevaFichaMedica = ({ onCerrar, onGuardar, datosIniciales = null }) => {
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
  const { register, handleSubmit, reset, control } = useForm({
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

  // Submit
  const onSubmit = (data) => {
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

  // Cerrar modal al hacer clic en el overlay (fuera del modal)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCerrar();
    }
  };

  return (
    <div className="ficha-overlay" onClick={handleOverlayClick}>
      <div className="ficha-modal">

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
            <h2 className="ficha-section__titulo">IDENTIFICACIÓN DEL PACIENTE</h2>

            {/* Fila 1: DNI, Nro Historia, Nombre */}
            <div className="ficha-row ficha-row--3cols">
              <div className="ficha-field">
                <label className="ficha-label">DNI</label>
                <input
                  type="text"
                  placeholder="Ej: 28456123"
                  className="ficha-input"
                  {...register('dni')}
                />
                <span className="ficha-hint">Tipo: caja de texto numérica.</span>
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
                <input
                  type="text"
                  placeholder="Ej: María Elena Martínez González"
                  className="ficha-input"
                  {...register('nombreApellido')}
                />
                <span className="ficha-hint">Tipo: caja de texto.</span>
              </div>
            </div>

            {/* Fila 2: Fecha Nacimiento, Sexo, Teléfono, Correo */}
            <div className="ficha-row ficha-row--4cols">
              <div className="ficha-field">
                <label className="ficha-label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="ficha-input"
                  {...register('fechaNacimiento')}
                />
                <span className="ficha-hint">Tipo: selector de fecha.</span>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Sexo</label>
                <select
                  className="ficha-input ficha-select"
                  {...register('sexo')}
                >
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
                <span className="ficha-hint">Tipo: lista desplegable.</span>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Teléfono</label>
                <input
                  type="tel"
                  placeholder="Ej: +54 11 4823-9017"
                  className="ficha-input"
                  {...register('telefono')}
                />
                <span className="ficha-hint">Tipo: caja de texto telefónica.</span>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Correo</label>
                <input
                  type="email"
                  placeholder="mail@dominio.com"
                  className="ficha-input"
                  {...register('correo')}
                />
                <span className="ficha-hint">Tipo: caja de texto email.</span>
              </div>
            </div>

            {/* Fila 3: Domicilio */}
            <div className="ficha-row">
              <div className="ficha-field ficha-field--full">
                <label className="ficha-label">Domicilio</label>
                <textarea
                  placeholder="Calle, número, ciudad y provincia"
                  className="ficha-textarea"
                  rows={3}
                  {...register('domicilio')}
                />
                <span className="ficha-hint">Tipo: área de texto.</span>
              </div>
            </div>
          </section>

          {/* ─── SECCIÓN 2: DATOS CLÍNICOS BÁSICOS ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">DATOS CLÍNICOS BÁSICOS</h2>

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
                <label className="ficha-label">Contacto de Emergencia</label>
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
            <h2 className="ficha-section__titulo">CONSIDERACIONES (OBLIGATORIO)</h2>
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
            <h2 className="ficha-section__titulo">ANTECEDENTES (OBLIGATORIO)</h2>
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
      </div>
    </div>
  );
};

export default NuevaFichaMedica;
