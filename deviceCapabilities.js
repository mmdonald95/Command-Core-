import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Browser } from '@capacitor/browser';

function createFileFromBase64(base64Data, fileName = 'capture.jpg', mimeType = 'image/jpeg') {
  const byteString = atob(base64Data);
  const byteNumbers = new Array(byteString.length);

  for (let index = 0; index < byteString.length; index += 1) {
    byteNumbers[index] = byteString.charCodeAt(index);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], fileName, { type: mimeType });
}

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export function getPlatformLabel() {
  return Capacitor.getPlatform();
}

export async function captureImageFile({
  fileName = `capture-${Date.now()}.jpg`,
  quality = 85,
} = {}) {
  if (!isNativeApp()) {
    return {
      supported: false,
      file: null,
      source: 'web',
    };
  }

  const result = await Camera.getPhoto({
    quality,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: CameraSource.Prompt,
  });

  if (!result?.base64String) {
    return {
      supported: true,
      file: null,
      source: 'native',
    };
  }

  return {
    supported: true,
    file: createFileFromBase64(
      result.base64String,
      fileName,
      result.format ? `image/${result.format}` : 'image/jpeg'
    ),
    previewUrl: result.webPath || null,
    source: 'native',
  };
}

export async function getCurrentCoordinates(options = {}) {
  if (isNativeApp()) {
    const nativePosition = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    });

    return {
      latitude: nativePosition.coords.latitude,
      longitude: nativePosition.coords.longitude,
      accuracy: nativePosition.coords.accuracy,
      source: 'native',
    };
  }

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported on this device.');
  }

  const browserPosition = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      ...options,
    });
  });

  return {
    latitude: browserPosition.coords.latitude,
    longitude: browserPosition.coords.longitude,
    accuracy: browserPosition.coords.accuracy,
    source: 'web',
  };
}

export async function openExternalUrl(url) {
  if (!url) return;

  if (isNativeApp()) {
    await Browser.open({ url });
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function syncNativePlugins() {
  return {
    isNative: isNativeApp(),
    platform: getPlatformLabel(),
    features: {
      camera: true,
      geolocation: true,
      browser: true,
    },
  };
}
