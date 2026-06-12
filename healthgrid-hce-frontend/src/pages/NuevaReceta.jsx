// src/pages/NuevaReceta.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import ModalWrapper from '../components/ModalWrapper';
import '../styles/NuevaReceta.css';
import { tipoConsultaLabel } from '../utils/helpers';

const NuevaReceta = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, evoluciones }) => {
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      fecha: new Date().toISOString().slice(0, 10),
      medicamentos: [{ nombre: '', indicaciones: '' }],
      observaciones: '',
      evolucionVinculada: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicamentos',
  });

  const onSubmit = (data) => {
    onGuardar(data);
  };

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="receta-overlay"
      modalClassName="receta-modal"
    >

        {/* Header */}
        <div className="receta-modal__header">
          <div>
            <h2 className="receta-modal__titulo">Nueva Receta</h2>
            <p className="receta-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="receta-modal__cerrar" onClick={onCerrar}>✕</button>
        </div>

        {/* Form */}
        <form className="receta-form" onSubmit={handleSubmit(onSubmit)}>

          {/* Fecha */}
          <div className="receta-form__field">
            <label className="receta-form__label">Fecha de emisión</label>
            <input type="date" className="receta-form__input" {...register('fecha')} />
          </div>

          {/* Medicamentos (dinámico) */}
          <div className="receta-form__field">
            <label className="receta-form__label">Medicamentos</label>
            <div className="receta-form__medicamentos">
              {fields.map((field, index) => (
                <div key={field.id} className="receta-form__medicamento-row">
                  <div className="receta-form__medicamento-fields">
                    <input
                      type="text"
                      className="receta-form__input"
                      placeholder="Nombre y dosis (ej: Enalapril 20mg)"
                      {...register(`medicamentos.${index}.nombre`)}
                    />
                    <input
                      type="text"
                      className="receta-form__input receta-form__input--indicacion"
                      placeholder="Indicaciones (ej: 1 comprimido por día en la mañana)"
                      {...register(`medicamentos.${index}.indicaciones`)}
                    />
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="receta-form__btn-quitar"
                      onClick={() => remove(index)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="receta-form__btn-agregar"
                onClick={() => append({ nombre: '', indicaciones: '' })}
              >
                + Agregar Medicamento
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div className="receta-form__field">
            <label className="receta-form__label">Observaciones</label>
            <textarea
              className="receta-form__textarea"
              placeholder="Controlar presión arterial, suspender si hay efectos adversos..."
              rows={3}
              {...register('observaciones')}
            />
          </div>

          {/* Evolución vinculada (opcional) */}
          {evoluciones && evoluciones.length > 0 && (
            <div className="receta-form__field">
              <label className="receta-form__label">Vincular a evolución (opcional)</label>
              <select className="receta-form__input receta-form__select" {...register('evolucionVinculada')}>
                <option value="">— Sin vincular —</option>
                {evoluciones.map((ev, i) => (
                  <option key={ev.id || i} value={i}>
                    Evolución #{ev.numero} — {tipoConsultaLabel(ev.tipoConsulta)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botones */}
          <div className="receta-form__actions">
            <button type="button" className="receta-form__btn receta-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="receta-form__btn receta-form__btn--guardar">
              Crear Receta
            </button>
          </div>

        </form>
    </ModalWrapper>
  );
};

export default NuevaReceta;
