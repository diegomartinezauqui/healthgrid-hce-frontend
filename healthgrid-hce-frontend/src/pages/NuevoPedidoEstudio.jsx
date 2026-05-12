// src/pages/NuevoPedidoEstudio.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import '../styles/NuevoPedidoEstudio.css';

const tipoConsultaLabel = (tipo) => {
  const mapa = {
    consulta_control: 'Consulta de Control',
    consulta_urgencia: 'Consulta de Urgencia',
    interconsulta: 'Interconsulta',
    control_laboratorio: 'Control de Laboratorio',
    seguimiento: 'Seguimiento',
    otro: 'Otro',
  };
  return mapa[tipo] || tipo || 'Consulta';
};

const formatearFechaCorta = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const NuevoPedidoEstudio = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, evoluciones }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      tipoEstudio: 'laboratorio',
      fechaSolicitud: new Date().toISOString().slice(0, 16),
      evolucionAsociada: '',
      descripcion: '',
      estado: 'pendiente',
    }
  });

  const onSubmit = (data) => {
    onGuardar(data);
    Swal.fire({
      title: '¡Pedido emitido!',
      text: 'El pedido de estudio ha sido registrado exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  return (
    <div className="pedido-overlay" onClick={handleOverlayClick}>
      <div className="pedido-modal">

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

          {/* Descripción del pedido */}
          <div className="pedido-form__field">
            <label className="pedido-form__label">Descripción del pedido</label>
            <textarea
              className="pedido-form__textarea"
              placeholder="Detalle de los estudios solicitados..."
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
      </div>
    </div>
  );
};

export default NuevoPedidoEstudio;
