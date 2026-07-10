// src/pages/NuevaReceta.jsx
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import ModalWrapper from '../components/ModalWrapper';
import { pacienteService } from '../services/pacienteService';
import Swal from 'sweetalert2';
import '../styles/NuevaReceta.css';
import { tipoConsultaLabel } from '../utils/helpers';

const NuevaReceta = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, evoluciones }) => {
  const [sugerencias, setSugerencias] = useState({}); // clave: field.id, valor: array de meds

  const { register, handleSubmit, control, setValue } = useForm({
    defaultValues: {
      fecha: new Date().toISOString().slice(0, 10),
      medicamentos: [{ nombre: '', indicaciones: '', cantidad: 1, esValido: false }],
      observaciones: '',
      evolucionVinculada: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicamentos',
  });

  const buscarMedsParaFila = async (fieldId, query) => {
    if (!query || query.length < 2) {
      setSugerencias(prev => ({ ...prev, [fieldId]: [] }));
      return;
    }
    try {
      const results = await pacienteService.buscarMedicamentos(query);
      setSugerencias(prev => ({ ...prev, [fieldId]: results || [] }));
    } catch (e) {
      console.error('[NuevaReceta] Error al buscar medicamentos:', e);
    }
  };

  const seleccionarMed = (index, fieldId, med) => {
    setValue(`medicamentos.${index}.nombre`, med.nombre);
    setValue(`medicamentos.${index}.esValido`, true);
    setSugerencias(prev => ({ ...prev, [fieldId]: [] }));
  };

  const onSubmit = (data) => {
    // Validar que cada medicamento ingresado se haya seleccionado del vademécum
    const todosSeleccionados = data.medicamentos.every((med) => med.esValido === true);

    if (!todosSeleccionados) {
      Swal.fire({
        title: 'Selección obligatoria',
        text: 'Por favor, selecciona los medicamentos sugeridos de la lista del Vademécum oficial.',
        icon: 'warning',
        confirmButtonColor: '#259A5E'
      });
      return;
    }

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
              {fields.map((field, index) => {
                const nombreRegister = register(`medicamentos.${index}.nombre`);
                return (
                  <div key={field.id} className="receta-form__medicamento-row">
                    <div className="receta-form__medicamento-fields" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          className="receta-form__input"
                          placeholder="Buscar medicamento (ej: Ibuprofeno)"
                          style={{ flex: 1 }}
                          autoComplete="off"
                          {...nombreRegister}
                          onChange={(e) => {
                            nombreRegister.onChange(e); // Actualizar react-hook-form
                            const val = e.target.value;
                            setValue(`medicamentos.${index}.esValido`, false); // Desmarcar validez
                            buscarMedsParaFila(field.id, val);
                          }}
                          onBlur={(e) => {
                            nombreRegister.onBlur(e);
                            // Cerrar sugerencias con delay para permitir click en el item
                            setTimeout(() => {
                              setSugerencias(prev => ({ ...prev, [field.id]: [] }));
                            }, 250);
                          }}
                        />
                        <input
                          type="number"
                          min="1"
                          placeholder="Cant."
                          className="receta-form__input"
                          style={{ width: '80px', flex: 'none' }}
                          {...register(`medicamentos.${index}.cantidad`, { valueAsNumber: true })}
                        />
                      </div>

                      {/* Lista desplegable flotante de sugerencias */}
                      {sugerencias[field.id] && sugerencias[field.id].length > 0 && (
                        <div className="receta-form__dropdown">
                          {sugerencias[field.id].map((med) => (
                            <div
                              key={med.id}
                              className="receta-form__dropdown-item"
                              onClick={() => seleccionarMed(index, field.id, med)}
                            >
                              <span className="receta-form__dropdown-item-nombre">{med.nombre}</span>
                              <span className="receta-form__dropdown-item-presentacion"> ({med.presentacion})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <input
                        type="text"
                        className="receta-form__input receta-form__input--indicacion"
                        placeholder="Indicaciones (ej: 1 comprimido por día en la mañana)"
                        style={{ marginTop: '6px' }}
                        {...register(`medicamentos.${index}.indicaciones`)}
                      />
                    </div>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        className="receta-form__btn-quitar"
                        onClick={() => {
                          setSugerencias(prev => {
                            const copia = { ...prev };
                            delete copia[field.id];
                            return copia;
                          });
                          remove(index);
                        }}
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                );
              })}
              <button
                type="button"
                className="receta-form__btn-agregar"
                onClick={() => append({ nombre: '', indicaciones: '', cantidad: 1, esValido: false })}
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
