const { withAndroidManifest } = require('@expo/config-plugins');

const BT_PERMISSIONS = [
  // Android ≤ 11
  { $: { 'android:name': 'android.permission.BLUETOOTH',       'android:maxSdkVersion': '30' } },
  { $: { 'android:name': 'android.permission.BLUETOOTH_ADMIN', 'android:maxSdkVersion': '30' } },
  // Android ≥ 12
  { $: { 'android:name': 'android.permission.BLUETOOTH_SCAN',      'android:usesPermissionFlags': 'neverForLocation' } },
  { $: { 'android:name': 'android.permission.BLUETOOTH_CONNECT' } },
  { $: { 'android:name': 'android.permission.BLUETOOTH_ADVERTISE' } },
  // Localización requerida para escaneo BT en Android < 12
  { $: { 'android:name': 'android.permission.ACCESS_FINE_LOCATION' } },
  { $: { 'android:name': 'android.permission.ACCESS_COARSE_LOCATION' } },
];

/**
 * Plugin que:
 * 1. Agrega el atributo `package` al AndroidManifest.xml (requerido por autolinking).
 * 2. Inyecta los permisos Bluetooth necesarios para react-native-bluetooth-escpos-printer.
 */
module.exports = function withAndroidPackage(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // 1. package attribute
    manifest.$ = manifest.$ || {};
    manifest.$['package'] = config.android?.package || 'com.jorgeafd1.agendaapp';

    // 2. Bluetooth permissions
    const existing = (manifest['uses-permission'] || []).map((p) => p.$?.['android:name']);
    for (const perm of BT_PERMISSIONS) {
      if (!existing.includes(perm.$['android:name'])) {
        manifest['uses-permission'] = manifest['uses-permission'] || [];
        manifest['uses-permission'].push(perm);
      }
    }

    return config;
  });
};
