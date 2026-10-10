let listener = null;

export const setAvisoListener = (fn) => {
  listener = fn;
};

export const mostrarAviso = ({
  type = "warning",
  title = "",
  message = "",
  confirmText = "Entendido",
  cancelText = "Cerrar",
  onConfirm,
  onCancel,
} = {}) => {
  if (typeof listener !== "function") {
    console.warn("AvisoModal no montado:", title, message);
    return;
  }
  listener({
    type,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    mode: "alert",
  });
};

export const confirmarAviso = ({
  type = "danger",
  title = "",
  message = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
} = {}) =>
  new Promise((resolve) => {
    if (typeof listener !== "function") {
      console.warn("AvisoModal no montado:", title, message);
      resolve(false);
      return;
    }
    listener({
      type,
      title,
      message,
      confirmText,
      cancelText,
      mode: "confirm",
      onConfirm: () => {
        onConfirm?.();
        resolve(true);
      },
      onCancel: () => {
        onCancel?.();
        resolve(false);
      },
    });
  });
