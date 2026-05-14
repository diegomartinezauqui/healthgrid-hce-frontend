// src/pages/SolicitarInternacion.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import '../styles/SolicitarInternacion.css';

const sectores = [
  'Piso 1 — Clínica General',
  'Piso 2 — Clínica Médica',
  'Piso 3 — Cirugía',
  'Piso 4 — Pediatría',
  'UCI — Unidad de Cuidados Intensivos',
  'UTI — Unidad de Terapia Intensiva',
  'Guardia — Observación',
  'Maternidad',
  'Cardiología',
  'Neurología',
  'Traumatología',
];

const SolicitarInternacion = ({ onCerrar, onEnviar, pacienteNombre, pacienteHC }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sector: 'Piso 2 — Clínica Médica',
      motivo: '',
      fechaHoraSugerida: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = (data) => {
    onEnviar(data);
    Swal.fire({
      title: '¡Solicitud enviada!',
      text: 'La solicitud de internación fue registrada exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2500,
      showConfirmButton: false,
    });
    onCerrar();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  return (
    <div className="intern-overlay" onClick={handleOverlayClick}>
      <div className="intern-modal">

        {/* Header */}
        <div className="intern-modal__header">
          <div>
            <h2 className="intern-modal__titulo">Solicitar Internación</h2>
            <p className="intern-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="intern-modal__cerrar" onClick={onCerrar}>✕</button>
        </div>

        {/* Form */}
        <form className="intern-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Sector / Servicio de Destino */}
          <div className="intern-form__field">
            <label className="intern-form__label">Sector / Servicio de Destino</label>
            <select
              className={`intern-form__input intern-form__select ${errors.sector ? 'intern-form__input--error' : ''}`}
              {...register('sector', { required: 'Seleccioná un sector de destino' })}
            >
              {sectores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.sector && <span className="intern-form__error">{errors.sector.message}</span>}
          </div>

          {/* Prioridad / Motivo del pase */}
          <div className="intern-form__field">
            <label className="intern-form__label">Prioridad / Motivo del pase</label>
            <textarea
              className={`intern-form__textarea ${errors.motivo ? 'intern-form__input--error' : ''}`}
              placeholder="Ej: Post-operatorio inmediato, requerimiento de mayor complejidad, pase a sala común por mejoría..."
              rows={4}
              {...register('motivo', { required: 'Ingresá el motivo del pase' })}
            />
            {errors.motivo && <span className="intern-form__error">{errors.motivo.message}</span>}
          </div>

          {/* Fecha y Hora sugerida */}
          <div className="intern-form__field">
            <label className="intern-form__label">Fecha y Hora sugerida</label>
            <input
              type="datetime-local"
              className={`intern-form__input ${errors.fechaHoraSugerida ? 'intern-form__input--error' : ''}`}
              {...register('fechaHoraSugerida', { required: 'Ingresá una fecha sugerida' })}
            />
            {errors.fechaHoraSugerida && <span className="intern-form__error">{errors.fechaHoraSugerida.message}</span>}
          </div>

          {/* Botones */}
          <div className="intern-form__actions">
            <button type="button" className="intern-form__btn intern-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="intern-form__btn intern-form__btn--enviar">
              Enviar Solicitud
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SolicitarInternacion;
