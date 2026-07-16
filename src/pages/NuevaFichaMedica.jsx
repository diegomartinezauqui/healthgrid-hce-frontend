// src/pages/NuevaFichaMedica.jsx
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import Swal from 'sweetalert2';
import { FiAlertCircle } from 'react-icons/fi';
import { RiAsterisk } from 'react-icons/ri';
import ModalWrapper from '../components/ModalWrapper';
import { pacienteService } from '../services/pacienteService';
import '../styles/NuevaFichaMedica.css';

const valoresVacios = {
  numeroHistoriaClinica: '',
  grupoSanguineo: '',
  contactoEmergencia: '',
  consideraciones: [{ tipo: '', severidad: 'Moderada', descripcion: '', detalleReaccion: '' }],
  antecedentes: [{ tipo: '', nombreDescripcion: '', fecha: '', observaciones: '' }],
  observaciones: '',
  dni: '',
  fechaNacimiento: '',
  genero: '',
  obraSocial: '',
  idObraSocial: '',
  idPlan: '',
  numeroAfiliado: '',
  telefono: '',
  domicilio: '',
  correo: '',
};

const NuevaFichaMedica = ({ onCerrar, onGuardar, datosIniciales = null, corePatient = null }) => {
  // Si hay datos iniciales (modo edición), usarlos; sino, usar valores vacíos y pre-cargar con datos del Core o de la ficha
  const defaultValues = datosIniciales
    ? {
        ...datosIniciales,
        dni: datosIniciales.dni || corePatient?.dni || '',
        fechaNacimiento: datosIniciales.fechaNacimiento || datosIniciales.fecha_nacimiento || corePatient?.fechaNacimiento || corePatient?.fecha_nacimiento || '',
        genero: datosIniciales.genero || datosIniciales.sexo || corePatient?.genero || corePatient?.sexo || '',
        obraSocial: datosIniciales.nombre_obra_social || datosIniciales.obraSocial || datosIniciales.obra_social || corePatient?.nombre_obra_social || corePatient?.obraSocial || corePatient?.obra_social || '',
        idObraSocial: datosIniciales.entidadFinanciadoraId || datosIniciales.idObraSocial || datosIniciales.id_obra_social_entidad || '',
        idPlan: datosIniciales.planId || datosIniciales.idPlan || datosIniciales.id_plan || '',
        numeroAfiliado: datosIniciales.numero_afiliado || datosIniciales.numeroAfiliado || datosIniciales.numero_afiliado || '',
        telefono: datosIniciales.telefono || corePatient?.telefono || '',
        domicilio: datosIniciales.domicilio || corePatient?.direccion || corePatient?.domicilio || '',
        correo: datosIniciales.correo || datosIniciales.email || corePatient?.email || corePatient?.correo || '',
        // Asegurar que siempre haya al menos una fila en los arrays
        consideraciones: datosIniciales.consideraciones?.length
          ? datosIniciales.consideraciones
          : [{ tipo: '', severidad: 'Moderada', descripcion: '', detalleReaccion: '' }],
        antecedentes: datosIniciales.antecedentes?.length
          ? datosIniciales.antecedentes
          : [{ tipo: '', nombreDescripcion: '', fecha: '', observaciones: '' }],
      }
    : {
        ...valoresVacios,
        dni: corePatient?.dni || '',
        fechaNacimiento: corePatient?.fechaNacimiento || corePatient?.fecha_nacimiento || '',
        genero: corePatient?.genero || corePatient?.sexo || '',
        obraSocial: corePatient?.nombre_obra_social || corePatient?.obraSocial || corePatient?.obra_social || '',
        idObraSocial: corePatient?.entidadFinanciadoraId || '',
        idPlan: corePatient?.planId || '',
        numeroAfiliado: corePatient?.numero_afiliado || '',
        telefono: corePatient?.telefono || '',
        domicilio: corePatient?.direccion || corePatient?.domicilio || '',
        correo: corePatient?.email || corePatient?.correo || '',
      };

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

  // ── Estado para selectores de cobertura en cascada (M7) ──
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [selectedObraSocialId, setSelectedObraSocialId] = useState(
    datosIniciales?.entidadFinanciadoraId || datosIniciales?.idObraSocial || datosIniciales?.id_obra_social_entidad || ''
  );
  const [selectedPlanId, setSelectedPlanId] = useState(
    datosIniciales?.planId || datosIniciales?.idPlan || datosIniciales?.id_plan || ''
  );
  const [cargandoOS, setCargandoOS] = useState(false);
  const [cargandoPlanes, setCargandoPlanes] = useState(false);

  // Cargar obras sociales al montar
  useEffect(() => {
    const cargarObrasSociales = async () => {
      setCargandoOS(true);
      try {
        const data = await pacienteService.obtenerObrasSociales();
        setObrasSociales(data || []);
      } catch (err) {
        console.error('Error cargando obras sociales:', err);
      } finally {
        setCargandoOS(false);
      }
    };
    cargarObrasSociales();
  }, []);

  // Cargar planes cuando cambie la obra social seleccionada
  useEffect(() => {
    if (!selectedObraSocialId) {
      setPlanes([]);
      setSelectedPlanId('');
      return;
    }
    const cargarPlanes = async () => {
      setCargandoPlanes(true);
      try {
        const data = await pacienteService.obtenerPlanes(parseInt(selectedObraSocialId));
        setPlanes(data || []);
      } catch (err) {
        console.error('Error cargando planes:', err);
      } finally {
        setCargandoPlanes(false);
      }
    };
    cargarPlanes();
  }, [selectedObraSocialId]);

  // Validación manual de campos obligatorios
  const validarCamposObligatorios = (data) => {
    const errores = [];

    // Validar contacto de emergencia (Datos Clínicos Básicos)
    if (!data.contactoEmergencia || data.contactoEmergencia.trim() === '') {
      errores.push('Contacto de Emergencia');
    }

    // Consideraciones y antecedentes son OPCIONALES: el paciente puede no tener.

    return errores;
  };

  // Submit
  const onSubmit = (data) => {
    const errores = validarCamposObligatorios(data);

    if (errores.length > 0) {
      Swal.fire({
        title: 'Campos obligatorios incompletos',
        html: `<p style="margin:0;font-size:0.95rem;color:#555">Por favor completá los siguientes campos antes de guardar:</p>
               <ul style="text-align:left;margin-top:10px;padding-left:20px;color:#c0392b;font-weight:600">
                 ${errores.map(e => `<li>${e}</li>`).join('')}
               </ul>`,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#2d7d46',
        timer: 5000,
        timerProgressBar: true,
        showCloseButton: true,
        customClass: {
          popup: 'swal-ficha-popup',
        },
      });
      return;
    }

    // Inyectar datos de cobertura seleccionados por cascada
    const planSeleccionado = planes.find(p => String(p.id) === String(selectedPlanId));
    const obraSocialSeleccionada = obrasSociales.find(os => String(os.id) === String(selectedObraSocialId));
    const datosConCobertura = {
      ...data,
      // Claves anteriores (para compatibilidad de renderizado legacy si hay)
      obraSocial: planSeleccionado?.nombre || obraSocialSeleccionada?.nombre || data.obraSocial || '',
      idObraSocial: selectedObraSocialId ? parseInt(selectedObraSocialId) : null,
      idPlan: selectedPlanId ? parseInt(selectedPlanId) : null,
      // Nuevos campos unificados M7
      nombre_obra_social: obraSocialSeleccionada?.nombre || null,
      nombre_plan: planSeleccionado?.nombre || null,
      entidadFinanciadoraId: selectedObraSocialId ? parseInt(selectedObraSocialId) : null,
      planId: selectedPlanId ? parseInt(selectedPlanId) : null,
      numero_afiliado: data.numeroAfiliado || data.numero_afiliado || null
    };

    if (onGuardar) {
      onGuardar(datosConCobertura);
    } else {
      console.log('Ficha Médica a guardar:', datosConCobertura);
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
            <h2 className="ficha-section__titulo">IDENTIFICACIÓN DEL PACIENTE (Datos Personales HCE)</h2>

            {/* Fila 1: DNI, Nro Historia, Nombre */}
            <div className="ficha-row ficha-row--3cols">
              <div className="ficha-field">
                <label className="ficha-label">DNI</label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  className="ficha-input"
                  {...register('dni')}
                />
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Número de Historia Clínica</label>
                <input
                  type="number"
                  placeholder="Ej: 482"
                  className="ficha-input"
                  readOnly={true}
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
                  {...register('numeroHistoriaClinica')}
                />
                <span className="ficha-hint">Bloqueado: Generado automáticamente.</span>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Nombre y Apellido</label>
                <div style={{ padding: '10px 15px', backgroundColor: '#f5f5f5', borderRadius: '8px', border: '1px solid #e0e0e0', color: '#666', fontWeight: 'bold' }}>
                  {corePatient?.nombreApellido || '—'}
                </div>
              </div>
            </div>

            {/* Fila 2: Fecha Nacimiento, Sexo, Obra Social */}
            <div className="ficha-row ficha-row--3cols">
              <div className="ficha-field">
                <label className="ficha-label">Fecha de Nacimiento</label>
                <input
                  type="date"
                  className="ficha-input"
                  {...register('fechaNacimiento')}
                />
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Sexo / Género</label>
                <select
                  className="ficha-input ficha-select"
                  {...register('genero')}
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino (M)</option>
                  <option value="F">Femenino (F)</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Obra Social</label>
                <select
                  className="ficha-input ficha-select"
                  value={selectedObraSocialId}
                  onChange={(e) => {
                    setSelectedObraSocialId(e.target.value);
                    setSelectedPlanId('');
                  }}
                  disabled={cargandoOS}
                >
                  <option value="">{cargandoOS ? 'Cargando...' : 'Seleccionar Obra Social'}</option>
                  {obrasSociales.map(os => (
                    <option key={os.id} value={os.id}>{os.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fila 2b: Plan de Cobertura y Nro de Afiliado */}
            <div className="ficha-row ficha-row--2cols">
              <div className="ficha-field">
                <label className="ficha-label">Plan de Cobertura</label>
                <select
                  className="ficha-input ficha-select"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  disabled={!selectedObraSocialId || cargandoPlanes}
                >
                  <option value="">
                    {!selectedObraSocialId
                      ? 'Seleccione una obra social primero'
                      : cargandoPlanes
                        ? 'Cargando planes...'
                        : 'Seleccionar Plan'}
                  </option>
                  {planes.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Nro. de Afiliado</label>
                <input
                  type="text"
                  placeholder="Ej: 123456789012"
                  className="ficha-input"
                  {...register('numeroAfiliado')}
                />
              </div>
            </div>

            {/* Fila 3: Teléfono, Domicilio, Correo (Editables) */}
            <div className="ficha-row ficha-row--3cols">
              <div className="ficha-field">
                <label className="ficha-label">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: 11-1234-5678"
                  className="ficha-input"
                  {...register('telefono')}
                />
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Domicilio</label>
                <input
                  type="text"
                  placeholder="Ej: Av. Rivadavia 1234, CABA"
                  className="ficha-input"
                  {...register('domicilio')}
                />
              </div>
              <div className="ficha-field">
                <label className="ficha-label">Correo Electrónico (Core)</label>
                <input
                  type="email"
                  placeholder="Ej: paciente@correo.com"
                  className="ficha-input"
                  readOnly={true}
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
                  {...register('correo')}
                />
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

          {/* ─── SECCIÓN 3: CONSIDERACIONES (OPCIONAL) ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">
              CONSIDERACIONES (OPCIONAL)
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
                <div className="ficha-field ficha-field--dynamic-item">
                  <select
                    className="ficha-input ficha-select"
                    {...register(`consideraciones.${index}.severidad`)}
                  >
                    <option value="Leve">Leve</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Severa">Severa</option>
                    <option value="Critica">Crítica</option>
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
              onClick={() => appendConsideracion({ tipo: '', severidad: 'Moderada', descripcion: '', detalleReaccion: '' })}
            >
              + Agregar Consideración
            </button>
          </section>

          {/* ─── SECCIÓN 4: ANTECEDENTES (OPCIONAL) ─── */}
          <section className="ficha-section">
            <h2 className="ficha-section__titulo">
              ANTECEDENTES (OPCIONAL)
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
