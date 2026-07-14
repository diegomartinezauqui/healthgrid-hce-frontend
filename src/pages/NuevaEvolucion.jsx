import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import ModalWrapper from '../components/ModalWrapper';
import { pacienteService } from '../services/pacienteService';
import '../styles/NuevaEvolucion.css';

const NuevaEvolucion = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      tipoConsulta: 'consulta_control',
      fechaHora: new Date().toISOString().slice(0, 16),
      profesional: 'Dr. Santiago Rossi — Jefe de Guardia',
      motivoEstado: '',
      diagnostico: '',
      planTratamiento: '',
      observacionesAdicionales: '',
    }
  });

  // Estados locales para la grilla de Actos Médicos (M7)
  const [practicas, setPracticas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [practicaSeleccionada, setPracticaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [observacionesActo, setObservacionesActo] = useState('');
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Efecto para buscar prestaciones con autocompletado reactivo (debounce de 300ms)
  useEffect(() => {
    if (busqueda.trim().length < 3) {
      setSugerencias([]);
      return;
    }

    // Evitamos re-buscar si lo que se escribió es exactamente la práctica ya seleccionada
    if (practicaSeleccionada && practicaSeleccionada.descripcion === busqueda) {
      return;
    }

    const buscar = async () => {
      const res = await pacienteService.buscarPrestacionesM7(busqueda);
      setSugerencias(res || []);
    };

    const delayDebounce = setTimeout(() => {
      buscar();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [busqueda, practicaSeleccionada]);

  // Cierra el dropdown al hacer clic fuera (opcional, para una UX más fluida)
  useEffect(() => {
    const clickOutside = () => setMostrarSugerencias(false);
    window.addEventListener('click', clickOutside);
    return () => window.removeEventListener('click', clickOutside);
  }, []);

  const handleAgregarPractica = () => {
    if (!practicaSeleccionada) {
      Swal.fire({
        icon: 'warning',
        title: 'Seleccioná una práctica',
        text: 'Buscá y seleccioná una práctica válida del nomenclador oficial antes de agregarla.',
        confirmButtonColor: '#259A5E'
      });
      return;
    }

    // Validación de duplicados
    if (practicas.some(p => p.codigo_nomenclador === practicaSeleccionada.codigoNomenclador)) {
      Swal.fire({
        icon: 'error',
        title: 'Práctica duplicada',
        text: 'Esta práctica ya fue agregada a la lista de esta evolución.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const nueva = {
      codigo_nomenclador: practicaSeleccionada.codigoNomenclador,
      descripcion: practicaSeleccionada.descripcion,
      cantidad: cantidad,
      observaciones: observacionesActo,
      tipo_prestacion: practicaSeleccionada.tipoPrestacion || 'PRACTICA'
    };

    setPracticas(prev => [...prev, nueva]);

    // Limpiar inputs de carga
    setBusqueda('');
    setPracticaSeleccionada(null);
    setCantidad(1);
    setObservacionesActo('');
    setSugerencias([]);
  };

  const handleQuitarPractica = (codigo) => {
    setPracticas(prev => prev.filter(p => p.codigo_nomenclador !== codigo));
  };

  const onSubmit = (data) => {
    // Adjuntamos el array de actos médicos al guardar la evolución
    onGuardar({ ...data, practicas });
    Swal.fire({
      title: '¡Evolución guardada!',
      text: 'La evolución clínica y las prácticas de facturación han sido registradas.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2000,
      showConfirmButton: false
    });
    onCerrar();
  };

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="evol-overlay"
      modalClassName="evol-modal"
    >

        {/* Header */}
        <div className="evol-modal__header">
          <div>
            <h2 className="evol-modal__titulo">Nueva Evolución</h2>
            <p className="evol-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="evol-modal__cerrar" onClick={onCerrar}>✕</button>
        </div>

        {/* Form */}
        <form className="evol-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Fila 1: Tipo + Fecha */}
          <div className="evol-form__row">
            <div className="evol-form__field">
              <label className="evol-form__label">Tipo de consulta</label>
              <select className="evol-form__input evol-form__select" {...register('tipoConsulta')}>
                <option value="consulta_control">Consulta de Control</option>
                <option value="consulta_urgencia">Consulta de Urgencia</option>
                <option value="interconsulta">Interconsulta</option>
                <option value="control_laboratorio">Control de Laboratorio</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="evol-form__field">
              <label className="evol-form__label">Fecha y hora</label>
              <input type="datetime-local" className="evol-form__input" {...register('fechaHora')} />
            </div>
          </div>

          {/* Profesional */}
          <div className="evol-form__field">
            <label className="evol-form__label">Profesional a cargo</label>
            <select className="evol-form__input evol-form__select" {...register('profesional')}>
              <option value="Dr. Santiago Rossi — Jefe de Guardia">Dr. Santiago Rossi — Jefe de Guardia</option>
              <option value="Dra. Laura Castiñeira — Clínica Médica">Dra. Laura Castiñeira — Clínica Médica</option>
              <option value="Dr. Martín López — Cardiología">Dr. Martín López — Cardiología</option>
              <option value="Dra. Ana García — Neurología">Dra. Ana García — Neurología</option>
            </select>
          </div>

          {/* Motivo / Estado actual */}
          <div className="evol-form__field">
            <label className="evol-form__label">Motivo de consulta / Estado actual</label>
            <textarea
              className="evol-form__textarea"
              placeholder="Describa síntomas referidos, signos vitales y hallazgos del examen físico..."
              rows={4}
              {...register('motivoEstado')}
            />
          </div>

          {/* Diagnóstico */}
          <div className="evol-form__field">
            <label className="evol-form__label">Diagnóstico presuntivo</label>
            <input
              type="text"
              className="evol-form__input"
              placeholder="Ej: Hipertensión arterial descompensada"
              {...register('diagnostico')}
            />
          </div>

          {/* Plan de tratamiento */}
          <div className="evol-form__field">
            <label className="evol-form__label">Plan de tratamiento</label>
            <textarea
              className="evol-form__textarea"
              placeholder="Indicaciones, medicación, estudios solicitados, derivaciones..."
              rows={3}
              {...register('planTratamiento')}
            />
          </div>

          {/* Observaciones adicionales */}
          <div className="evol-form__field">
            <label className="evol-form__label">Observaciones adicionales</label>
            <textarea
              className="evol-form__textarea"
              placeholder="Notas clínicas, instrucciones al paciente, próximos controles..."
              rows={3}
              {...register('observacionesAdicionales')}
            />
          </div>

          {/* Sección de Actos Médicos (M7) */}
          <div className="evol-acts-section">
            <h3 className="evol-acts-section__title">
              ⚖️ Prácticas Clínicas / Actos Médicos (Facturables)
            </h3>

            <div className="evol-acts-form">
              <div className="evol-form__field evol-acts-search-container">
                <label className="evol-form__label">Buscar Práctica (Nomenclador M7)</label>
                <input
                  type="text"
                  className="evol-form__input"
                  placeholder="Ej: Radiografía de tórax, Hemograma..."
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setMostrarSugerencias(true);
                  }}
                  onFocus={() => setMostrarSugerencias(true)}
                  onClick={(e) => e.stopPropagation()} // Evita cerrar el dropdown al hacer clic en el input
                />
                {mostrarSugerencias && sugerencias.length > 0 && (
                  <div className="evol-acts-search-results" onClick={(e) => e.stopPropagation()}>
                    {sugerencias.map((sug) => (
                      <button
                        key={sug.id || sug.codigoNomenclador}
                        type="button"
                        className="evol-acts-search-item"
                        onClick={() => {
                          setPracticaSeleccionada(sug);
                          setBusqueda(sug.descripcion);
                          setMostrarSugerencias(false);
                        }}
                      >
                        <strong>{sug.codigoNomenclador}</strong>
                        <span>{sug.descripcion} ({sug.tipoPrestacion})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="evol-acts-form__row">
                <div className="evol-form__field" style={{ flex: '0 0 90px' }}>
                  <label className="evol-form__label">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    className="evol-form__input"
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="evol-form__field">
                  <label className="evol-form__label">Observaciones del acto</label>
                  <input
                    type="text"
                    className="evol-form__input"
                    placeholder="Notas sobre esta práctica..."
                    value={observacionesActo}
                    onChange={(e) => setObservacionesActo(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="evol-acts-form__btn-add"
                  onClick={handleAgregarPractica}
                >
                  + Agregar
                </button>
              </div>
            </div>

            {/* Listado de Prácticas Agregadas */}
            {practicas.length > 0 && (
              <div className="evol-acts-list">
                {practicas.map((p) => (
                  <div key={p.codigo_nomenclador} className="evol-acts-item">
                    <div className="evol-acts-item__details">
                      <span className="evol-acts-item__code">{p.codigo_nomenclador} (Cant: {p.cantidad})</span>
                      <span className="evol-acts-item__desc">{p.descripcion}</span>
                      {p.observaciones && <span className="evol-acts-item__obs">Obs: {p.observaciones}</span>}
                    </div>
                    <button
                      type="button"
                      className="evol-acts-item__delete"
                      onClick={() => handleQuitarPractica(p.codigo_nomenclador)}
                      title="Quitar práctica"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="evol-form__actions">
            <button type="button" className="evol-form__btn evol-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="evol-form__btn evol-form__btn--guardar">
              Guardar Evolución
            </button>
          </div>

        </form>
    </ModalWrapper>
  );
};

export default NuevaEvolucion;
