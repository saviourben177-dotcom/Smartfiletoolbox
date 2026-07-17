import React from 'react';
import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';

const TITLES: Record<string, string> = {
  'image-compress': 'Compress Images',
  'image-resize': 'Resize Images',
  'image-convert': 'Convert Images',
  'image-rotate-crop': 'Rotate & Crop',
  'images-to-pdf': 'Images to PDF',
  'pdf-merge': 'Merge PDF',
  'pdf-split': 'Split PDF',
  'pdf-compress': 'Compress PDF',
  'zip-create': 'ZIP Creator',
  'zip-extract': 'ZIP Extractor',
  'qr-generate': 'QR Code Generator',
  'qr-scan': 'QR Code Scanner',
  'qr-history': 'QR History',
  'file-cleaner': 'File Cleaner',
  'downloads-manager': 'Downloads Manager',
  'large-files': 'Large Files Finder',
  'duplicate-finder': 'Duplicate File Finder',
  'storage-overview': 'Storage Analyzer',
};

export default function ToolsLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
      }}
    >
      {Object.entries(TITLES).map(([name, title]) => (
        <Stack.Screen key={name} name={name} options={{ title }} />
      ))}
    </Stack>
  );
}
