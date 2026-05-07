import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function Snackbar() {
  const [message, setMessage] = useState('');
  const [bgColor, setBgColor] = useState('#333');
  const slideAnim = useRef(new Animated.Value(100)).current; // fuera de pantalla
  const visibleRef = useRef(false);

  // Método para mostrar el Snackbar
  const show = (text, duration = 3000, backgroundColor = '#333') => {
    if (visibleRef.current) return; // evita que se muestre otro mientras está activo

    setMessage(text);
    setBgColor(backgroundColor);
    visibleRef.current = true;

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        visibleRef.current = false;
      });
    }, duration);
  };

  // Guardar función global (opcional, para llamar desde cualquier pantalla)
  global.showSnackbar = show;

  return (
    <Animated.View
      style={[
        styles.snackbar,
        { backgroundColor: bgColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 8,
    elevation: 2,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
