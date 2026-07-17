import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ToolCard } from '@/components/ToolCard';
import { SectionHeader } from '@/components/ui/primitives';
import { useColors } from '@/hooks/useColors';
import { TOOLS, TOOL_CATEGORIES } from '@/constants/tools';

export default function HomeScreen() {
  const colors = useColors();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.foreground }]}>Smart File Toolbox</Text>
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Every file tool you need, fully offline.
        </Text>
      </View>

      {TOOL_CATEGORIES.filter((category) => category.id !== 'browser').map((category) => {
        const tools = TOOLS.filter((tool) => tool.category === category.id);
        if (tools.length === 0) return null;
        return (
          <View key={category.id}>
            <SectionHeader title={category.title} />
            <View style={styles.grid}>
              {tools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
    marginBottom: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
});
