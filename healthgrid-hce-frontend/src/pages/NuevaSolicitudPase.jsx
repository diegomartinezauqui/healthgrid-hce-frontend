// src/pages/NuevaSolicitudPase.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import '../styles/NuevaSolicitudPase.css';

const sectores = [
  'Piso 1 — Clínica General',
  'Piso 2 — Clínica Médica',
  'Piso 3 — Cirugía',
  'Piso 4 — Pediatría',
  'UCI — Unidad de Cuidados Intensivos',
  'UTI — Terapia Intensiva',
  'Guardia — Observación',
  'Quirófano',
  'Maternidad',
  'Cardiología',
  'Neurología',
  'Traumatología',
];

const NuevaSolicitudPase = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sector: 'Quirófano',
      motivo: '',
      fechaHoraSugerida: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = (data) => {
    onGuardar(data);
    Swal.fire({
      title: '¡Solicitud enviada!',
      text: 'La solicitud de pase de cama fue registrada exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2000,
      showConfirmButton: false,
    });
    onCerrar();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  return (
    <div className="spase-overlay" onClick={handleOverlayClick}>
      <div className="spase-modal">

        {/* Header */}
        <div className="spase-modal__header">
          <div>
            <h2 className="spase-modal__titulo">Solicitar Pase de Cama / Sector</h2>
            <p className="spase-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="spase-modal__cerrar" onClick={onCerrar}>✕</button>
        </div>

        <form className="spase-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Sector / Servicio de Destino */}
          <div className="spase-form__field">
            <label className="spase-form__label">Sector / Servicio de Destino</label>
            <select
              className={`spase-form__input spase-form__select ${errors.sector ? 'spase-form__input--error' : ''}`}
              {...register('sector', { required: 'Seleccioná un sector de destino' })}
            >
              {sectores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.sector && <span className="spase-form__error">{errors.sector.message}</span>}
          </div>

          {/* Prioridad / Motivo del pase */}
          <div className="spase-form__field">
            <label className="spase-form__label">Prioridad / Motivo del pase</label>
            <textarea
              className={`spase-form__textarea ${errors.motivo ? 'spase-form__input--error' : ''}`}
              placeholder="Ej: Post-operatorio inmediato, requerimiento de mayor complejidad, pase a sala común por mejoría..."
              rows={4}
              {...register('motivo', { required: 'Ingresá el motivo del pase' })}
            />
            {errors.motivo && <span className="spase-form__error">{errors.motivo.message}</span>}
          </div>

          {/* Fecha y Hora sugerida */}
          <div className="spase-form__field">
            <label className="spase-form__label">Fecha y Hora sugerida</label>
            <input
              type="datetime-local"
              className={`spase-form__input ${errors.fechaHoraSugerida ? 'spase-form__input--error' : ''}`}
              {...register('fechaHoraSugerida', { required: 'Ingresá una fecha sugerida' })}
            />
            {errors.fechaHoraSugerida && <span className="spase-form__error">{errors.fechaHoraSugerida.message}</span>}
          </div>

          {/* Botones */}
          <div className="spase-form__actions">
            <button type="button" className="spase-form__btn spase-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="spase-form__btn spase-form__btn--enviar">
              Enviar Solicitud
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NuevaSolicitudPase;
