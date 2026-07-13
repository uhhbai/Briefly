import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';

export default function AccountSettings() {
  const { profile, updateProfile, signOut } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.display_name ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [telegram, setTelegram] = useState(profile?.telegram_chat_id ?? '');
  const [saving, setSaving] = useState<null | 'save' | 'test' | 'signout'>(null);

  async function save() {
    setSaving('save');
    try {
      await updateProfile({
        display_name: name.trim() || profile?.display_name || 'Briefly user',
        location: location.trim() || profile?.location || 'Singapore',
        telegram_chat_id: telegram.trim() || null,
      });
      toast.success('Profile settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(null);
    }
  }

  async function sendTelegramTest() {
    if (!telegram.trim()) {
      toast.error('Add your Telegram chat ID first, then Save.');
      return;
    }
    setSaving('test');
    try {
      // Persist the id first so the server test hits the right chat.
      await updateProfile({ telegram_chat_id: telegram.trim() });

      const { data, error } = await supabase.functions.invoke('notify-bid', { body: { test: true } });

      // When the function returns a non-2xx status, supabase-js puts the real
      // body on error.context (a Response) — read it so we can show why.
      let result: { sent?: boolean; reason?: string } | null = data ?? null;
      if (error) {
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.json === 'function') {
          result = await ctx.json().catch(() => null);
        }
        if (!result) {
          toast.error(
            'Could not reach the notification function. Make sure notify-bid is deployed to Supabase.'
          );
          return;
        }
      }

      if (result?.sent) {
        toast.success('Test sent — check your Telegram.');
      } else if (result?.reason === 'no_bot_token') {
        toast.error('Server has no bot token yet. Set TELEGRAM_BOT_TOKEN and redeploy notify-bid.');
      } else if (result?.reason === 'no_chat_id') {
        toast.error('Add your Telegram chat ID and Save first (get it from @userinfobot).');
      } else if (result?.reason === 'telegram_error') {
        toast.error('Telegram rejected it. Open a chat with your bot, press Start, then retry.');
      } else {
        toast.error('Test could not be delivered. Check the bot token and your chat ID.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reach the notification function.');
    } finally {
      setSaving(null);
    }
  }

  async function handleSignOut() {
    setSaving('signout');
    try {
      await signOut();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sign out.');
      setSaving(null);
    }
  }

  return (
    <Screen showBack showHome eyebrow="Account" title="Settings">
      <TextField label="Display name" value={name} onChangeText={setName} placeholder="Your name" />
      <TextField label="Location" value={location} onChangeText={setLocation} placeholder="Singapore" />
      <Button title="Save settings" iconRight="check-circle" loading={saving === 'save'} onPress={save} />

      <Divider />

      <View style={{ gap: Spacing.two }}>
        <ThemedText type="subtitle">Telegram bid alerts</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Get a message the moment a vendor bids on your brief. Message @userinfobot on Telegram to get your
          numeric chat ID, paste it here, press Start in a chat with the Briefly bot, then send a test.
        </ThemedText>
      </View>
      <TextField
        label="Telegram chat ID"
        value={telegram}
        onChangeText={setTelegram}
        placeholder="e.g. 123456789"
        keyboardType="number-pad"
      />
      <Button
        title="Send test message"
        variant="secondary"
        iconRight="send"
        loading={saving === 'test'}
        onPress={sendTelegramTest}
      />

      <Divider />

      <Button title="Sign out" variant="ghost" iconRight="log-out" loading={saving === 'signout'} onPress={handleSignOut} />
    </Screen>
  );
}
