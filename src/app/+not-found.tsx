import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';

export default function NotFound() {
  return (
    <Screen eyebrow="404" title="Page not found">
      <ThemedText type="default" themeColor="textSecondary">
        The page you’re looking for doesn’t exist or has moved.
      </ThemedText>
      <Button title="Back to Discover" iconRight="arrow-right" onPress={() => router.replace('/')} style={{ alignSelf: 'flex-start' }} />
    </Screen>
  );
}
