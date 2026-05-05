// src/pages/NuevaEvolucion.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
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

  const onSubmit = (data) => {
    onGuardar(data);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  return (
    <div className="evol-overlay" onClick={handleOverlayClick}>
      <div className="evol-modal">

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
      </div>
    </div>
  );
};

export default NuevaEvolucion;
