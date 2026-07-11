

/**
 * ModalWrapper es un componente contenedor reutilizable para todos los modales del sistema.
 * Maneja el evento de cerrar cuando se hace clic fuera del modal (en el overlay) y
 * unifica la estructura de envoltura de los modales.
 *
 * @param {Object} props
 * @param {Function} props.onCerrar - Callback ejecutado al cerrar el modal.
 * @param {string} props.overlayClassName - Nombre de la clase CSS para el overlay.
 * @param {string} props.modalClassName - Nombre de la clase CSS para el contenedor del modal.
 * @param {React.ReactNode} props.children - Contenido interno del modal.
 */
const ModalWrapper = ({
  onCerrar,
  overlayClassName = 'modal-default-overlay',
  modalClassName = 'modal-default-container',
  children,
}) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onCerrar) {
      onCerrar();
    }
  };

  return (
    <div className={overlayClassName} onClick={handleOverlayClick}>
      <div className={modalClassName}>
        {children}
      </div>
    </div>
  );
};

export default ModalWrapper;
