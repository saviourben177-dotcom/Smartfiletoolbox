import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/primitives';
import type { PermissionResult } from '@/services/permissionsService';

interface PermissionGateProps {
  status: PermissionResult | 'checking';
  onRequest: () => void;
  title: string;
  message: string;
  children: React.ReactNode;
}

export function PermissionGate({ status, onRequest, title, message, children }: PermissionGateProps) {
  if (status === 'granted') return <>{children}</>;
  if (status === 'checking') return null;

  return (
    <View style={styles.container}>
      <EmptyState icon="lock" title={title} message={message} />
      <Button label="Grant Access" onPress={onRequest} icon="unlock" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
});
