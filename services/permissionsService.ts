import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';

export type PermissionResult = 'granted' | 'denied' | 'unsupported';

/**
 * Requests access to the photo/video library. Required before browsing
 * media assets or saving processed images/videos back to the gallery.
 */
export async function requestMediaLibraryPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export async function getMediaLibraryPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await MediaLibrary.getPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

/** Requests camera access, required for the QR code scanner. */
export async function requestCameraPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}

export async function getCameraPermission(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return 'unsupported';
  const { status } = await Camera.getCameraPermissionsAsync();
  return status === 'granted' ? 'granted' : 'denied';
}
