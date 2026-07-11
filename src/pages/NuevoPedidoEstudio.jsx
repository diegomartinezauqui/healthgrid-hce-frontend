// src/pages/NuevoPedidoEstudio.jsx
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import ModalWrapper from '../components/ModalWrapper';
import { CATALOGO_LABORATORIO_MOCK } from '../services/ordenService';
import '../styles/NuevoPedidoEstudio.css';
import { tipoConsultaLabel, formatearFechaCorta } from '../utils/helpers';

const NuevoPedidoEstudio = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, evoluciones }) => {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      tipoEstudio: 'laboratorio',
      fechaSolicitud: new Date().toISOString().slice(0, 16),
      evolucionAsociada: '',
      descripcion: '',
      estado: 'pendiente',
      subtipo: 'RADIOLOGY',
      estudio_ids: [],
      origen: 'Ambulatorio'
    }
  });

  const tipoEstudio = watch('tipoEstudio');

  const onSubmit = (data) => {
    const estudio_ids_ints = (data.estudio_ids || []).map(id => parseInt(id, 10));

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

          {/* Catálogo de Laboratorio Bioquímico M4 (Solo si es laboratorio) */}
          {tipoEstudio === 'laboratorio' && (
            <div className="pedido-form__field">
              <label className="pedido-form__label" style={{ marginBottom: '8px', color: '#11352A' }}>
                Catálogo de Estudios Bioquímicos (M4)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', padding: '10px 14px', backgroundColor: '#FAFBFA', border: '1px solid #E8ECE9', borderRadius: '8px' }}>
                {CATALOGO_LABORATORIO_MOCK.map((est) => (
                  <label key={est.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer', color: '#444', fontWeight: '500' }}>
                    <input
                      type="checkbox"
                      value={est.id}
                      {...register('estudio_ids')}
                    />
                    {est.nombre}
                  </label>
                ))}
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

          {/* Fila: Evolución asociada + Origen */}
          <div className="pedido-form__row">
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
            <div className="pedido-form__field">
              <label className="pedido-form__label">Origen de la orden</label>
              <select className="pedido-form__input pedido-form__select" {...register('origen')}>
                <option value="Ambulatorio">Ambulatorio</option>
                <option value="Internacion">Internación</option>
                <option value="Turno">Turno</option>
              </select>
            </div>
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

          {/* Estado */}
          <div className="pedido-form__field">
            <label className="pedido-form__label">Estado</label>
            <select className="pedido-form__input pedido-form__select" {...register('estado')}>
              <option value="pendiente">Pendiente</option>
              <option value="completado">Completado</option>
            </select>
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
