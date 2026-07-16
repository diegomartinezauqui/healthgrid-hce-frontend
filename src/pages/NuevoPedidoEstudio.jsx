// src/pages/NuevoPedidoEstudio.jsx
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import ModalWrapper from '../components/ModalWrapper';
import { ordenService } from '../services/ordenService';
import '../styles/NuevoPedidoEstudio.css';
import { tipoConsultaLabel, formatearFechaCorta } from '../utils/helpers';

const CATEGORIAS = ['Todos', 'Hematologia', 'Bioquimica', 'Orina'];

const NuevoPedidoEstudio = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, evoluciones }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      tipoEstudio: 'laboratorio',
      fechaSolicitud: new Date().toISOString().slice(0, 16),
      evolucionAsociada: '',
      descripcion: '',
      estado: 'pendiente',
      subtipo: 'RADIOLOGY',
      estudio_ids: []
    }
  });

  const tipoEstudio = watch('tipoEstudio');

  // Catálogo de analitos desde M4 vía backend
  const [catalogo, setCatalogo] = useState([]);
  const [catalogoLoading, setCatalogoLoading] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  useEffect(() => {
    if (tipoEstudio !== 'laboratorio') return;
    const cargar = async () => {
      setCatalogoLoading(true);
      try {
        const categoria = categoriaActiva === 'Todos' ? null : categoriaActiva;
        const lista = await ordenService.obtenerCatalogoLaboratorio(categoria);
        setCatalogo(lista);
      } finally {
        setCatalogoLoading(false);
      }
    };
    cargar();
  }, [tipoEstudio, categoriaActiva]);

  const onSubmit = (data) => {
    const estudio_ids_ints = (data.estudio_ids || []).map(id => parseInt(id, 10));

    if (data.tipoEstudio === 'laboratorio' && estudio_ids_ints.length === 0) {
      Swal.fire({
        title: 'Selección requerida',
        text: 'Por favor, seleccioná al menos un analito del catálogo.',
        icon: 'warning',
        confirmButtonColor: '#259A5E'
      });
      return;
    }

    onGuardar({
      ...data,
      estudio_ids: estudio_ids_ints
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

          {/* Catálogo de Analitos M4 (Solo si es laboratorio) */}
          {tipoEstudio === 'laboratorio' && (
            <div className="pedido-form__field">
              <label className="pedido-form__label" style={{ marginBottom: '8px', color: '#11352A' }}>
                Analitos — Catálogo M4
              </label>

              {/* Tabs de categoría */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoriaActiva(cat)}
                    style={{
                      padding: '4px 14px',
                      borderRadius: '20px',
                      border: '1px solid',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      borderColor: categoriaActiva === cat ? '#259A5E' : '#D0D9D4',
                      backgroundColor: categoriaActiva === cat ? '#259A5E' : 'transparent',
                      color: categoriaActiva === cat ? '#fff' : '#555',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Lista de analitos */}
              {catalogoLoading ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                  Cargando analitos desde M4...
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', padding: '10px 14px', backgroundColor: '#FAFBFA', border: '1px solid #E8ECE9', borderRadius: '8px' }}>
                  {catalogo.length === 0 ? (
                    <p style={{ gridColumn: '1 / -1', color: '#aaa', fontSize: '0.85rem', margin: 0 }}>
                      No hay analitos disponibles para esta categoría.
                    </p>
                  ) : (
                    catalogo.map((analito) => (
                      <label key={analito.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: '#444', fontWeight: '500' }}>
                        <input
                          type="checkbox"
                          value={analito.id}
                          {...register('estudio_ids')}
                        />
                        <span>
                          {analito.nombre}
                          {analito.unidadMedida && (
                            <span style={{ color: '#888', fontWeight: '400', marginLeft: '4px' }}>
                              ({analito.unidadMedida})
                            </span>
                          )}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
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

          {/* Evolución asociada */}
          <div className="pedido-form__field">
            <label className="pedido-form__label">Evolución asociada</label>
            <select className="pedido-form__input pedido-form__select" {...register('evolucionAsociada')}>
              <option value="">— Sin vincular —</option>
              {(evoluciones || []).map((ev, i) => (
                <option key={ev.id || i} value={i}>
                  Evolución #{ev.numero} — {tipoConsultaLabel(ev.tipoConsulta)} ({formatearFechaCorta(ev.fechaHora)})
                </option>
              ))}
            </select>
          </div>

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
