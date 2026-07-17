// src/pages/SolicitarCirugiaUrgente.jsx
import { useForm } from 'react-hook-form';
import ModalWrapper from '../components/ModalWrapper';
import '../styles/SolicitarInternacion.css';

const SolicitarCirugiaUrgente = ({ onCerrar, onEnviar, pacienteNombre, pacienteHC }) => {
  const defaultInicio = new Date();
  const defaultFin = new Date(defaultInicio.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      medico_cirujano_id: 45,
      fecha_hora_inicio: defaultInicio.toISOString().slice(0, 16),
      fecha_hora_fin_estimada: defaultFin.toISOString().slice(0, 16),
      diagnostico: 'Apendicitis aguda',
      hospital_id: '1',
      specialty_id: 3,
    },
  });

  const onSubmit = (data) => {
    onEnviar(data);
  };

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="intern-overlay"
      modalClassName="intern-modal"
    >
        {/* Header */}
        <div className="intern-modal__header">
          <div>
            <h2 className="intern-modal__titulo" style={{ color: '#b91c1c' }}>Solicitar Cirugía Urgente (Proxy M6)</h2>
            <p className="intern-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="intern-modal__cerrar" onClick={onCerrar}>✕</button>
        </div>

        {/* Form */}
        <form className="intern-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Médico Cirujano ID */}
          <div className="intern-form__field">
            <label className="intern-form__label">Médico Cirujano (ID)</label>
            <input
              type="number"
              className={`intern-form__input ${errors.medico_cirujano_id ? 'intern-form__input--error' : ''}`}
              {...register('medico_cirujano_id', { required: 'Ingresá el ID del médico cirujano' })}
            />
            {errors.medico_cirujano_id && <span className="intern-form__error">{errors.medico_cirujano_id.message}</span>}
          </div>

          {/* Diagnóstico */}
          <div className="intern-form__field">
            <label className="intern-form__label">Diagnóstico</label>
            <input
              type="text"
              className={`intern-form__input ${errors.diagnostico ? 'intern-form__input--error' : ''}`}
              placeholder="Ej: Apendicitis aguda"
              {...register('diagnostico', { required: 'Ingresá el diagnóstico' })}
            />
            {errors.diagnostico && <span className="intern-form__error">{errors.diagnostico.message}</span>}
          </div>

          {/* Especialidad (Specialty ID) */}
          <div className="intern-form__field">
            <label className="intern-form__label">Especialidad Quirúrgica</label>
            <select
              className="intern-form__input intern-form__select"
              {...register('specialty_id', { required: true })}
            >
              <option value="1">Cirugía General (ID 1)</option>
              <option value="2">Traumatología (ID 2)</option>
              <option value="3">Cardiovascular (ID 3)</option>
              <option value="4">Pediatría (ID 4)</option>
            </select>
          </div>

          {/* Fecha y Hora de Inicio */}
          <div className="intern-form__field">
            <label className="intern-form__label">Fecha y Hora de Inicio</label>
            <input
              type="datetime-local"
              className={`intern-form__input ${errors.fecha_hora_inicio ? 'intern-form__input--error' : ''}`}
              {...register('fecha_hora_inicio', { required: 'Ingresá fecha/hora de inicio' })}
            />
            {errors.fecha_hora_inicio && <span className="intern-form__error">{errors.fecha_hora_inicio.message}</span>}
          </div>

          {/* Fecha y Hora de Fin Estimada */}
          <div className="intern-form__field">
            <label className="intern-form__label">Fecha y Hora de Fin Estimada</label>
            <input
              type="datetime-local"
              className={`intern-form__input ${errors.fecha_hora_fin_estimada ? 'intern-form__input--error' : ''}`}
              {...register('fecha_hora_fin_estimada', { required: 'Ingresá fecha/hora fin estimada' })}
            />
            {errors.fecha_hora_fin_estimada && <span className="intern-form__error">{errors.fecha_hora_fin_estimada.message}</span>}
          </div>

          {/* Hospital ID */}
          <div className="intern-form__field">
            <label className="intern-form__label">ID de Hospital</label>
            <input
              type="text"
              className={`intern-form__input ${errors.hospital_id ? 'intern-form__input--error' : ''}`}
              {...register('hospital_id', { required: 'Ingresá el ID de Hospital' })}
            />
            {errors.hospital_id && <span className="intern-form__error">{errors.hospital_id.message}</span>}
          </div>

          {/* Botones */}
          <div className="intern-form__actions">
            <button type="button" className="intern-form__btn intern-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="intern-form__btn intern-form__btn--enviar" style={{ backgroundColor: '#b91c1c', borderColor: '#b91c1c' }}>
              Solicitar Quirófano Urgente
            </button>
          </div>
        </form>
    </ModalWrapper>
  );
};

export default SolicitarCirugiaUrgente;
