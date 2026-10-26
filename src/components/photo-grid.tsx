// Rule-of-thirds overlay for full-body photos ("cam photo", "edit2").
import { StyleSheet, View } from 'react-native';

export function PhotoGrid() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' }]}>
      {[1, 2].map((i) => (
        <View key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i * 100) / 3}%`, width: 1, backgroundColor: 'rgba(255,255,255,0.8)' }} />
      ))}
      {[1, 2].map((i) => (
        <View key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: `${(i * 100) / 3}%`, height: 1, backgroundColor: 'rgba(255,255,255,0.8)' }} />
      ))}
    </View>
  );
}
