import React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useThemeStore } from '../../stores/theme';
import useIsFloatingKeyboard from '../../utils/hooks/use-is-floating-keyboard';
export const Container = ({ children }) => {
  const colors = useThemeStore(state => state.colors);
  const floating = useIsFloatingKeyboard();
  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={Platform.OS === 'ios' && !floating}
      style={{
        backgroundColor: colors.bg,
        width: '100%',
        height: '100%'
      }}
    >
      <SafeAreaView
        style={{
          height: '100%',
          backgroundColor: colors.bg,
          overflow: 'hidden'
        }}
      >
        {children}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Container;
