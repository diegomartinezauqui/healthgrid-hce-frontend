// src/pages/SolicitarInternacion.jsx
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import ModalWrapper from '../components/ModalWrapper';
import '../styles/SolicitarInternacion.css';
import { SECTORES_DESTINO as sectores } from '../utils/helpers';
import '../styles/SolicitarInternacion.css';

const SolicitarInternacion = ({ onCerrar, onEnviar, pacienteNombre, pacienteHC }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sector: 'Piso 2 — Clínica Médica',
      prioridad: 'Media',
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

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="intern-overlay"
      modalClassName="intern-modal"
    >

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

          {/* Prioridad */}
          <div className="intern-form__field">
            <label className="intern-form__label">Prioridad</label>
            <select
              className="intern-form__input intern-form__select"
              {...register('prioridad', { required: true })}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          {/* Motivo */}
          <div className="intern-form__field">
            <label className="intern-form__label">Motivo</label>
            <textarea
              className={`intern-form__textarea ${errors.motivo ? 'intern-form__input--error' : ''}`}
              placeholder="Ej: Criterio de neumonía grave, requerimiento de oxigenoterapia..."
              rows={4}
              {...register('motivo', { required: 'Ingresá el motivo' })}
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
    </ModalWrapper>
  );
};

export default SolicitarInternacion;
