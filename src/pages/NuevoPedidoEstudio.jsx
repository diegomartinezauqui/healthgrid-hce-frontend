// src/pages/NuevoPedidoEstudio.jsx
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import ModalWrapper from '../components/ModalWrapper';
import { ordenService } from '../services/ordenService';
import '../styles/NuevoPedidoEstudio.css';
import { tipoConsultaLabel, formatearFechaCorta } from '../utils/helpers';

const NuevoPedidoEstudio = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, evoluciones }) => {
  const [catalogoLaboratorio, setCatalogoLaboratorio] = useState([]);
  const [catalogoLoading, setCatalogoLoading] = useState(false);
  const [catalogoError, setCatalogoError] = useState('');
  const [categoriaAnalitos, setCategoriaAnalitos] = useState('');
  const [analitos, setAnalitos] = useState([]);
  const [analitosLoading, setAnalitosLoading] = useState(false);
  const [analitosError, setAnalitosError] = useState('');

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      tipoEstudio: 'laboratorio',
      fechaSolicitud: new Date().toISOString().slice(0, 16),
      evolucionAsociada: '',
      descripcion: '',
      prioridad: 'Normal',
      subtipo: 'RADIOLOGY',
      estudio_ids: []
    }
  });

  const tipoEstudio = watch('tipoEstudio');
  const estudioIdsSeleccionados = watch('estudio_ids') || [];

  useEffect(() => {
    if (tipoEstudio !== 'laboratorio') return;

    let activo = true;
    const cargarCatalogo = async () => {
      setCatalogoLoading(true);
      setCatalogoError('');

      try {
        const catalogo = await ordenService.obtenerCatalogoLaboratorio();
        if (!activo) return;

        setCatalogoLaboratorio(catalogo || []);
        setCategoriaAnalitos((actual) => actual || catalogo?.[0]?.categoria || '');
      } catch (error) {
        if (!activo) return;

        setCatalogoLaboratorio([]);
        setCatalogoError('No se pudo cargar el catálogo de estudios de laboratorio.');
      } finally {
        if (activo) setCatalogoLoading(false);
      }
    };

    cargarCatalogo();

    return () => {
      activo = false;
    };
  }, [tipoEstudio]);

  useEffect(() => {
    if (!categoriaAnalitos || tipoEstudio !== 'laboratorio') {
      setAnalitos([]);
      return;
    }

    let activo = true;
    const cargarAnalitos = async () => {
      setAnalitosLoading(true);
      setAnalitosError('');

      try {
        const resultado = await ordenService.obtenerAnalitosLaboratorio(categoriaAnalitos);
        if (activo) setAnalitos(resultado || []);
      } catch (error) {
        if (!activo) return;

        setAnalitos([]);
        setAnalitosError('No se pudieron cargar los analitos complementarios.');
      } finally {
        if (activo) setAnalitosLoading(false);
      }
    };

    cargarAnalitos();

    return () => {
      activo = false;
    };
  }, [categoriaAnalitos, tipoEstudio]);

  const evolucionesOptions = useMemo(() => (
    (evoluciones || []).map((ev, index) => ({
      id: ev?.id ?? ev?.id_evolucion ?? index,
      label: `Evolución #${ev?.numero ?? index + 1} — ${tipoConsultaLabel(ev?.tipoConsulta)} (${formatearFechaCorta(ev?.fechaHora)})`
    }))
  ), [evoluciones]);

  const catalogoCategorias = useMemo(() => (
    Array.from(new Set(catalogoLaboratorio.map((estudio) => estudio.categoria).filter(Boolean)))
  ), [catalogoLaboratorio]);

  const estudiosSeleccionadosDetalle = useMemo(() => {
    const ids = new Set((estudioIdsSeleccionados || []).map((id) => Number(id)));
    return catalogoLaboratorio.filter((estudio) => ids.has(Number(estudio.id)));
  }, [catalogoLaboratorio, estudioIdsSeleccionados]);

  const onSubmit = (data) => {
    const estudio_ids_ints = (data.estudio_ids || []).map(id => parseInt(id, 10));
    const evolucionIdx = parseInt(data.evolucionAsociada, 10);
    const evolucionSeleccionada = Number.isNaN(evolucionIdx) ? null : (evoluciones || [])[evolucionIdx];

    if (data.tipoEstudio === 'laboratorio' && estudio_ids_ints.length === 0) {
      Swal.fire({
        title: 'Selección requerida',
        text: 'Por favor, selecciona al menos un estudio bioquímico del catálogo.',
        icon: 'warning',
        confirmButtonColor: '#259A5E'
      });
      return;
    }

    onGuardar({
      ...data,
      descripcion_pedido: data.descripcion,
      estudio_ids: estudio_ids_ints,
      id_evolucion: evolucionSeleccionada?.id ?? evolucionSeleccionada?.id_evolucion ?? null,
      estado: 'pendiente',
    });

    Swal.fire({
      title: '¡Pedido emitido!',
      text: 'El pedido de estudio ha sido registrado exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2000,
      showConfirmButton: false
    });
  };

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="pedido-overlay"
      modalClassName="pedido-modal"
    >

        {/* Header */}
        <div className="pedido-modal__header">
          <div>
            <h2 className="pedido-modal__titulo">Nuevo Pedido de Estudio</h2>
            <p className="pedido-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="pedido-modal__cerrar" onClick={onCerrar}>✕</button>
        </div>

        {/* Form */}
        <form className="pedido-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Fila: Tipo de estudio + Fecha */}
          <div className="pedido-form__row">
            <div className="pedido-form__field">
              <label className="pedido-form__label">Tipo de estudio</label>
              <select className="pedido-form__input pedido-form__select" {...register('tipoEstudio')}>
                <option value="laboratorio">Laboratorio</option>
                <option value="imagenes">Imágenes</option>
                <option value="cardiologia">Cardiología</option>
                <option value="neurologia">Neurología</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="pedido-form__field">
              <label className="pedido-form__label">Fecha de solicitud</label>
              <input type="datetime-local" className="pedido-form__input" {...register('fechaSolicitud')} />
            </div>
          </div>

          <div className="pedido-form__row">
            <div className="pedido-form__field">
              <label className="pedido-form__label">Prioridad</label>
              <select className="pedido-form__input pedido-form__select" {...register('prioridad')}>
                <option value="Normal">Normal</option>
                <option value="Urgente">Urgente</option>
                <option value="Emergencia">Emergencia</option>
              </select>
            </div>
            <div className="pedido-form__field">
              <label className="pedido-form__label">Evolución asociada</label>
              <select className="pedido-form__input pedido-form__select" {...register('evolucionAsociada')}>
                <option value="">— Sin vincular —</option>
                {evolucionesOptions.map((ev, index) => (
                  <option key={ev.id ?? index} value={index}>
                    {ev.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Catálogo de Laboratorio Bioquímico M4 (Solo si es laboratorio) */}
          {tipoEstudio === 'laboratorio' && (
            <div className="pedido-form__field">
              <label className="pedido-form__label" style={{ marginBottom: '8px', color: '#11352A' }}>
                Catálogo de Estudios Bioquímicos
              </label>
              <div className="pedido-form__catalogo">
                {catalogoLoading ? (
                  <p className="pedido-form__hint">Cargando catálogo de estudios...</p>
                ) : catalogoError ? (
                  <p className="pedido-form__error">{catalogoError}</p>
                ) : catalogoLaboratorio.length > 0 ? (
                  <div className="pedido-form__catalogo-grid">
                    {catalogoLaboratorio.map((est) => (
                      <label key={est.id} className="pedido-form__catalogo-item">
                        <input
                          type="checkbox"
                          value={est.id}
                          {...register('estudio_ids')}
                        />
                        <span className="pedido-form__catalogo-item-text">
                          <strong>{est.nombre}</strong>
                          {est.categoria && <small>{est.categoria}</small>}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="pedido-form__hint">No hay estudios disponibles para mostrar.</p>
                )}
              </div>
            </div>
          )}

          {tipoEstudio === 'laboratorio' && catalogoCategorias.length > 0 && (
            <div className="pedido-form__field">
              <label className="pedido-form__label">Detalle complementario de analitos</label>
              <div className="pedido-form__catalogo-extra">
                <div className="pedido-form__field">
                  <select
                    className="pedido-form__input pedido-form__select"
                    value={categoriaAnalitos}
                    onChange={(event) => setCategoriaAnalitos(event.target.value)}
                  >
                    {catalogoCategorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                {analitosLoading ? (
                  <p className="pedido-form__hint">Cargando analitos complementarios...</p>
                ) : analitosError ? (
                  <p className="pedido-form__error">{analitosError}</p>
                ) : analitos.length > 0 ? (
                  <div className="pedido-form__analitos-lista">
                    {analitos.map((analito) => (
                      <span key={analito.id ?? analito.nombre} className="pedido-form__analito-chip">
                        {analito.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="pedido-form__hint">No hay analitos adicionales para esta categoría.</p>
                )}
              </div>
            </div>
          )}

          {/* Modalidad de Imágenes (Solo si es imágenes) */}
          {tipoEstudio === 'imagenes' && (
            <div className="pedido-form__field">
              <label className="pedido-form__label">Modalidad de Imagen (M5)</label>
              <select className="pedido-form__input pedido-form__select" {...register('subtipo')}>
                <option value="RADIOLOGY">Radiografía (RADIOLOGY)</option>
                <option value="RESONANCE">Resonancia (RESONANCE)</option>
                <option value="ECOGRAFY">Ecografía (ECOGRAFY)</option>
                <option value="TOMOGRAPHY">Tomografía (TOMOGRAPHY)</option>
                <option value="MAMMOGRAPHY">Mamografía (MAMMOGRAPHY)</option>
                <option value="DENSITOMETRY">Densitometría (DENSITOMETRY)</option>
                <option value="ECODOPPLER">Ecodoppler (ECODOPPLER)</option>
                <option value="ENDOSCOPY">Endoscopía (ENDOSCOPY)</option>
              </select>
            </div>
          )}

          {/* Origen Clínico (Ambulatorio, Internacion, Turno) */}
          <div className="pedido-form__field">
            <label className="pedido-form__label">Origen Clínico</label>
            <select className="pedido-form__input pedido-form__select" {...register('origen')}>
              <option value="Ambulatorio">Ambulatorio</option>
              <option value="Internacion">Internación</option>
              <option value="Turno">Turno / Guardia</option>
            </select>
          </div>

          {/* Descripción del pedido */}
          <div className="pedido-form__field">
            <label className="pedido-form__label">Descripción / Indicaciones del pedido</label>
            <textarea
              className="pedido-form__textarea"
              placeholder="Detalle adicional, preparación o indicaciones clínicas..."
              rows={4}
              {...register('descripcion')}
            />
          </div>

          {estudiosSeleccionadosDetalle.length > 0 && (
            <div className="pedido-form__summary">
              <span className="pedido-form__summary-label">Seleccionados</span>
              <span className="pedido-form__summary-value">
                {estudiosSeleccionadosDetalle.map((est) => est.nombre).join(', ')}
              </span>
            </div>
          )}

          {/* Botones */}
          <div className="pedido-form__actions">
            <button type="button" className="pedido-form__btn pedido-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="pedido-form__btn pedido-form__btn--guardar">
              Emitir Pedido
            </button>
          </div>

        </form>
    </ModalWrapper>
  );
};

export default NuevoPedidoEstudio;
