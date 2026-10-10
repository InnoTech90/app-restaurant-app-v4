import { useEffect, useState } from "react";
import { setAvisoListener } from "../../../utils/avisoModal";
import ModalWarning from "../ModalWarning/ModalWarning";

const AvisoModalHost = () => {
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    setAvisoListener((payload) => setAviso(payload));
    return () => setAvisoListener(null);
  }, []);

  const cerrar = () => {
    const actual = aviso;
    setAviso(null);
    actual?.onCancel?.();
  };

  const confirmar = () => {
    const actual = aviso;
    setAviso(null);
    actual?.onConfirm?.();
  };

  return (
    <ModalWarning
      visible={!!aviso}
      type={aviso?.type ?? "warning"}
      title={aviso?.title ?? ""}
      message={aviso?.message ?? ""}
      confirmText={aviso?.confirmText ?? "Entendido"}
      cancelText={aviso?.cancelText ?? "Cerrar"}
      onCancel={cerrar}
      onConfirm={confirmar}
    />
  );
};

export default AvisoModalHost;
