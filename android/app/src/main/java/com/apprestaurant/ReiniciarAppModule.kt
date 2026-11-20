package com.apprestaurant

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil

/**
 * Recarga la interfaz (JS) de la app. Se usa al cambiar el modo claro/oscuro,
 * porque los estilos se calculan al arrancar. `DevSettings.reload()` solo
 * funciona en desarrollo; en el APK de producción no hace nada.
 */
class ReiniciarAppModule(private val ctx: ReactApplicationContext) :
    ReactContextBaseJavaModule(ctx) {

  override fun getName(): String = "ReiniciarApp"

  @ReactMethod
  fun reiniciar() {
    UiThreadUtil.runOnUiThread {
      val app = ctx.applicationContext as ReactApplication
      val host = app.reactHost
      if (host != null) {
        host.reload("Cambio de apariencia")
      } else {
        app.reactNativeHost.reactInstanceManager.recreateReactContextInBackground()
      }
    }
  }
}
