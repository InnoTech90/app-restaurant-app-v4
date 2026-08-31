const KEEP_AWAKE_RE = /Unable to (activate|deactivate) keep awake/i;

function isKeepAwakeError(value) {
  if (!value) return false;
  if (typeof value === "string") return KEEP_AWAKE_RE.test(value);
  if (value instanceof Error) return KEEP_AWAKE_RE.test(value.message);
  return KEEP_AWAKE_RE.test(String(value));
}

function shouldSuppress(args) {
  return args.some((arg) => isKeepAwakeError(arg));
}

/**
 * expo-camera activa keep-awake al montar la cámara. En Android/Expo Go
 * a veces falla si la app no está en primer plano y RN lo reporta como
 * "Uncaught (in promise)". Es inofensivo; lo suprimimos para no confundir.
 */
export function installKeepAwakeErrorSuppressor() {
  if (globalThis.__KEEP_AWAKE_SUPPRESSOR__) return;
  globalThis.__KEEP_AWAKE_SUPPRESSOR__ = true;

  const originalError = console.error;
  console.error = (...args) => {
    if (shouldSuppress(args)) return;
    originalError(...args);
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (shouldSuppress(args)) return;
    originalWarn(...args);
  };

  try {
    const rejectionTracking = require("promise/setimmediate/rejection-tracking");
    rejectionTracking.enable({
      allRejections: true,
      onUnhandled: (id, error) => {
        if (isKeepAwakeError(error)) return;
        originalWarn(
          `Possible Unhandled Promise Rejection (id: ${id}):`,
          error,
        );
      },
      onHandled: () => {},
    });
  } catch {
    // Sin polyfill de promise; LogBox + parche de consola bastan.
  }
}

installKeepAwakeErrorSuppressor();
