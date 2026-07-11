// src/pages/CargarResultadoEstudio.jsx
import { useForm, useFieldArray } from 'react-hook-form';
import Swal from 'sweetalert2';
import ModalWrapper from '../components/ModalWrapper';
import '../styles/CargarResultadoEstudio.css';

const CargarResultadoEstudio = ({ onCerrar, onGuardar, pacienteNombre, pacienteHC, estudio }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codigoExterno: estudio?.resultado?.codigoExterno || '',
      profesionalFirmante: estudio?.resultado?.profesionalFirmante || 'Dra. Laura Castiñeira — Clínica Médica',
      fechaResultado: estudio?.resultado?.fechaResultado || new Date().toISOString().slice(0, 10),
      informe: estudio?.resultado?.informe || '',
      archivosAdjuntos: estudio?.resultado?.archivosAdjuntos || [{ nombre: 'Informe.pdf', url: 'https://ejemplo.com/informe.pdf' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'archivosAdjuntos',
  });

  const onSubmit = (data) => {
    onGuardar(data);
    Swal.fire({
      title: '¡Resultados cargados!',
      text: 'Los resultados del estudio clínico se registraron exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E',
      timer: 2000,
      showConfirmButton: false,
    });
    onCerrar();
  };

  return (
    <ModalWrapper
      onCerrar={onCerrar}
      overlayClassName="cres-overlay animate-fade-in"
      modalClassName="cres-modal animate-slide-up"
    >
        {/* Header */}
        <div className="cres-modal__header">
          <div>
            <h2 className="cres-modal__titulo">Cargar Resultados de Estudio</h2>
            <p className="cres-modal__subtitulo">
              {pacienteNombre} · HC-{pacienteHC}
            </p>
          </div>
          <button type="button" className="cres-modal__cerrar" onClick={onCerrar}>
            ✕
          </button>
        </div>

        {/* Form */}
        <form className="cres-form" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="cres-form__row">
            {/* Código Externo */}
            <div className="cres-form__field">
              <label className="cres-form__label">Código Externo / Nro. Protocolo</label>
              <input
                type="text"
                className="cres-form__input"
                placeholder="Ej: LAB-481290"
                {...register('codigoExterno')}
              />
            </div>

            {/* Fecha del Resultado */}
            <div className="cres-form__field">
              <label className="cres-form__label">Fecha del Resultado</label>
              <input
                type="date"
                className="cres-form__input"
                {...register('fechaResultado', { required: 'Ingresá la fecha del resultado' })}
              />
              {errors.fechaResultado && <span className="cres-form__error">{errors.fechaResultado.message}</span>}
            </div>
          </div>

          {/* Profesional Firmante */}
          <div className="cres-form__field">
            <label className="cres-form__label">Profesional Firmante / Bioquímico / Radiólogo</label>
            <input
              type="text"
              className="cres-form__input"
              placeholder="Ej: Dra. Laura Castiñeira — Clínica Médica"
              {...register('profesionalFirmante', { required: 'Ingresá el profesional firmante' })}
            />
            {errors.profesionalFirmante && <span className="cres-form__error">{errors.profesionalFirmante.message}</span>}
          </div>

          {/* Informe de Texto */}
          <div className="cres-form__field">
            <label className="cres-form__label">Informe Clínico / Conclusiones del Estudio</label>
            <textarea
              className="cres-form__textarea"
              placeholder="Escriba los resultados cuantitativos o cualitativos del estudio..."
              rows={5}
              {...register('informe', { required: 'El informe clínico es obligatorio' })}
            />
            {errors.informe && <span className="cres-form__error">{errors.informe.message}</span>}
          </div>

          {/* Archivos Adjuntos */}
          <div className="cres-form__field">
            <label className="cres-form__label">Enlaces a Documentos / Archivos Adjuntos</label>
            <div className="cres-form__adjuntos">
              {fields.map((field, index) => (
                <div key={field.id} className="cres-form__adjunto-row">
                  <input
                    type="text"
                    className="cres-form__input"
                    placeholder="Nombre del archivo (ej: Hemograma.pdf)"
                    {...register(`archivosAdjuntos.${index}.nombre`, { required: true })}
                  />
                  <input
                    type="text"
                    className="cres-form__input cres-form__input--grow"
                    placeholder="URL del archivo (ej: https://drive.com/...)"
                    {...register(`archivosAdjuntos.${index}.url`, { required: true })}
                  />
                  {fields.length > 0 && (
                    <button
                      type="button"
                      className="cres-form__btn-quitar"
                      onClick={() => remove(index)}
                    >
                      Quitar
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="cres-form__btn-agregar"
                onClick={() => append({ nombre: '', url: '' })}
              >
                + Adjuntar Enlace
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="cres-form__actions">
            <button type="button" className="cres-form__btn cres-form__btn--cancelar" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="cres-form__btn cres-form__btn--guardar">
              Guardar Resultados
            </button>
          </div>
        </form>
    </ModalWrapper>
  );
};

export default CargarResultadoEstudio;
