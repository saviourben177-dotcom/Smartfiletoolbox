import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{children}</Text>
    </View>
  );
}

/**
 * In-app privacy policy, mirroring PRIVACY_POLICY.md at the project root.
 * Google Play also requires a publicly hosted URL pointing to this same
 * content in Play Console — this screen alone does not satisfy that
 * requirement, but gives users an always-available in-app copy.
 */
export default function PrivacyPolicyScreen() {
  const colors = useColors();
  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.banner, { backgroundColor: colors.accent, borderRadius: colors.radius }]}>
          <Feather name="shield" size={20} color={colors.accentForeground} />
          <Text style={[styles.bannerText, { color: colors.accentForeground }]}>
            Smart File Toolbox works fully offline. Nothing you open, create, or scan ever leaves your device.
          </Text>
        </View>

        <Section title="Summary">
          Smart File Toolbox does not collect, store, transmit, or share any personal data. The app has no backend
          server, no user accounts, no analytics, and no third-party SDKs. Every feature runs entirely on your
          device.
        </Section>

        <Section title="Camera">
          Used only to scan QR codes in the QR Scanner tool. The camera feed is used to detect a code on-screen in
          real time. No photo or video is captured, saved, or transmitted.
        </Section>

        <Section title="Photos and videos">
          Used to let you pick photos for the image tools, save edited photos back to your gallery, and power the
          Storage Analyzer, Large Files Finder, and Duplicate Finder tools, which read file names and sizes to
          report storage usage. Files are processed locally only.
        </Section>

        <Section title="Files you choose">
          Files you explicitly pick to zip, unzip, or convert are processed and saved back to your device only.
        </Section>

        <Section title="Data we do not collect">
          No accounts or user identifiers. No analytics or crash reporting. No advertising SDKs. No network
          requests of any kind — the app has no server to send data to.
        </Section>

        <Section title="Children's privacy">
          The app does not knowingly collect information from anyone, including children, because it does not
          collect information from anyone at all.
        </Section>

        <Section title="Data retention">
          Nothing is collected or transmitted off your device, so there is nothing to retain. Files you create or
          import remain on your device and can be removed at any time using the File Browser or File Cleaner
          tools.
        </Section>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
});
