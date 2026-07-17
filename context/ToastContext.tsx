import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { generateId } from '@/utils/id';

type ToastVariant = 'default' | 'success' | 'error';

interface ToastMessage {
  id: string;
  text: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (text: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const colors = useColors();

  const show = useCallback(
    (text: string, variant: ToastVariant = 'default') => {
      const message: ToastMessage = { id: generateId(), text, variant };
      setToast(message);
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) setToast((current) => (current?.id === message.id ? null : current));
      });
    },
    [opacity],
  );

  const iconName = toast?.variant === 'success' ? 'check-circle' : toast?.variant === 'error' ? 'alert-circle' : 'info';
  const iconColor = toast?.variant === 'success' ? colors.success : toast?.variant === 'error' ? colors.destructive : colors.primary;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.container,
            { opacity, backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.foreground },
          ]}
        >
          <Feather name={iconName} size={18} color={iconColor} />
          <Text style={[styles.text, { color: colors.cardForeground }]} numberOfLines={2}>
            {toast.text}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
});
