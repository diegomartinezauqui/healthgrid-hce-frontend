import React from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import '../styles/NuevoEpisodio.css';

const NuevoEpisodio = ({ onCerrar, onCrear, pacienteNombre, pacienteHC }) => {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      tipoEpisodio: 'ambulatorio',
      fechaApertura: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
      motivo: '',
    }
  });

  const onSubmit = (data) => {
    onCrear(data);
    Swal.fire({
      title: '¡Episodio creado!',
      text: 'El nuevo episodio se ha creado exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2000,
      showConfirmButton: false
    });
    onCerrar();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCerrar();
    }
  };

  return (
    <div className="episodio-overlay" onClick={handleOverlayClick}>
      <div className="episodio-modal">

        {/* Header */}
        <div className="episodio-modal__header">
          <div>
            <h2 className="episodio-modal__titulo">Nuevo Episodio Médico</h2>
            <p className="episodio-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button
            type="button"
            className="episodio-modal__cerrar"
            onClick={onCerrar}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="episodio-form" onSubmit={handleSubmit(onSubmit)}>

          <div className="episodio-form__row">
            <div className="episodio-form__field">
              <label className="episodio-form__label">Tipo de Episodio</label>
              <select
                className="episodio-form__input episodio-form__select"
                {...register('tipoEpisodio')}
              >
                <option value="ambulatorio">Ambulatorio</option>
                <option value="internado">Internado</option>
              </select>
            </div>
            <div className="episodio-form__field">
              <label className="episodio-form__label">Fecha de apertura</label>
              <input
                type="datetime-local"
                className="episodio-form__input"
                {...register('fechaApertura')}
              />
            </div>
          </div>

          <div className="episodio-form__field">
            <label className="episodio-form__label">Motivo u Observaciones (opcional)</label>
            <textarea
              className="episodio-form__textarea"
              placeholder="Breve nota sobre el motivo de apertura del episodio..."
              rows={4}
              {...register('motivo')}
            />
          </div>

          {/* Botones */}
          <div className="episodio-form__actions">
            <button
              type="button"
              className="episodio-form__btn episodio-form__btn--cancelar"
              onClick={onCerrar}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="episodio-form__btn episodio-form__btn--crear"
            >
              Crear Episodio
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default NuevoEpisodio;
