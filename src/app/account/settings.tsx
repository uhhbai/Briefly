import * as Linking from 'expo-linking';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';

type NotifyBidResult = {
  sent?: boolean;
  botAvailable?: boolean;
  botUsername?: string | null;
  botName?: string | null;
  reason?: 'no_bot_token' | 'no_chat_id' | 'telegram_error' | string;
  detail?: string;
};

const configuredBotUsername =
  process.env.EXPO_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, '').trim() || 'BrieflyNotifBot';

function normalizeChatId(value: string) {
  const match = value.trim().match(/-?\d+/);
  return match?.[0] ?? '';
}

function describeTelegramError(result: NotifyBidResult | null, botUsername: string | null) {
  const detail = (result?.detail ?? '').toLowerCase();
  const botLabel = botUsername ? `@${botUsername}` : 'the Briefly Telegram bot';

  if (detail.includes('chat not found')) {
    return 'Telegram could not find that chat ID. Paste the numeric ID from @userinfobot, then try again.';
  }
  if (detail.includes('bot was blocked')) {
    return `Telegram says the bot is blocked. Open ${botLabel}, press Start, then send another test.`;
  }
  if (detail.includes('forbidden')) {
    return `Open ${botLabel}, press Start, then send another test. Telegram blocks bot messages until then.`;
  }
  return `Telegram rejected the test. Open ${botLabel}, press Start, and check the chat ID.`;
}

export default function AccountSettings() {
  const { profile, updateProfile, signOut } = useAuth();
  const theme = useTheme();
  const toast = useToast();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [locationDraft, setLocationDraft] = useState<string | null>(null);
  const [telegramDraft, setTelegramDraft] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(configuredBotUsername);
  const [saving, setSaving] = useState<null | 'save' | 'test' | 'bot' | 'signout'>(null);
  const name = nameDraft ?? profile?.display_name ?? '';
  const location = locationDraft ?? profile?.location ?? '';
  const telegram = telegramDraft ?? profile?.telegram_chat_id ?? '';
  const savedChatId = profile?.telegram_chat_id?.trim() || '';
  const typedChatId = normalizeChatId(telegram);
  const hasUnsavedTelegram = typedChatId !== savedChatId || (telegram.trim() !== '' && !typedChatId);
  const telegramReady = Boolean(savedChatId);

  async function save() {
    const nextChatId = normalizeChatId(telegram);
    if (telegram.trim() && !nextChatId) {
      toast.error('Paste the numeric Telegram chat ID from @userinfobot.');
      return;
    }

    setSaving('save');
    try {
      await updateProfile({
        display_name: name.trim() || profile?.display_name || 'Briefly user',
        location: location.trim() || profile?.location || 'Singapore',
        telegram_chat_id: nextChatId || null,
      });
      setNameDraft(null);
      setLocationDraft(null);
      setTelegramDraft(null);
      toast.success('Profile settings saved.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save settings.');
    } finally {
      setSaving(null);
    }
  }

  async function readFunctionResult(data: unknown, error: unknown): Promise<NotifyBidResult | null> {
    if (!error) return (data as NotifyBidResult | null) ?? null;

    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      return ctx.json().catch(() => null);
    }
    return null;
  }

  async function openTelegramUrl(url: string, fallbackMessage: string) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('Cannot open URL.');
      await Linking.openURL(url);
    } catch {
      toast.error(fallbackMessage);
    }
  }

  async function openUserInfoBot() {
    await openTelegramUrl('https://t.me/userinfobot', 'Open Telegram and search for @userinfobot.');
  }

  async function resolveBotUsername() {
    if (botUsername) return botUsername;

    setSaving('bot');
    try {
      const { data, error } = await supabase.functions.invoke('notify-bid', { body: { botInfo: true } });
      const result = await readFunctionResult(data, error);
      if (result?.botUsername) {
        setBotUsername(result.botUsername);
        return result.botUsername;
      }
      if (result?.reason === 'no_bot_token') {
        toast.error('The server is missing TELEGRAM_BOT_TOKEN. Add it in Supabase, then redeploy notify-bid.');
      } else {
        toast.error('Could not find the Briefly Telegram bot. Check the notify-bid function setup.');
      }
      return null;
    } finally {
      setSaving(null);
    }
  }

  async function openBrieflyBot() {
    const username = await resolveBotUsername();
    if (!username) return;
    await openTelegramUrl(`https://t.me/${username}`, `Open Telegram and search for @${username}.`);
  }

  async function sendTelegramTest() {
    const nextChatId = normalizeChatId(telegram);
    if (!nextChatId) {
      toast.error('Paste your numeric Telegram chat ID first.');
      return;
    }

    setSaving('test');
    try {
      await updateProfile({ telegram_chat_id: nextChatId });
      setTelegramDraft(null);

      const { data, error } = await supabase.functions.invoke('notify-bid', { body: { test: true } });
      const result = await readFunctionResult(data, error);

      if (!result) {
        toast.error('Could not reach notify-bid. Make sure the function is deployed to Supabase.');
        return;
      }
      if (result.botUsername) {
        setBotUsername(result.botUsername);
      }

      if (result.sent) {
        toast.success('Test sent. Check Telegram for the Briefly message.');
      } else if (result.reason === 'no_bot_token') {
        toast.error('Server has no bot token yet. Set TELEGRAM_BOT_TOKEN and redeploy notify-bid.');
      } else if (result.reason === 'no_chat_id') {
        toast.error('Save your Telegram chat ID first. You can get it from @userinfobot.');
      } else if (result.reason === 'telegram_error') {
        toast.error(describeTelegramError(result, result.botUsername ?? botUsername));
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
      <TextField label="Display name" value={name} onChangeText={setNameDraft} placeholder="Your name" />
      <TextField label="Location" value={location} onChangeText={setLocationDraft} placeholder="Singapore" />
      <Button
        title={hasUnsavedTelegram ? 'Save profile and Telegram ID' : 'Save settings'}
        iconRight="check-circle"
        loading={saving === 'save'}
        onPress={save}
      />

      <Divider />

      <Card accentColor={telegramReady ? theme.success : theme.tint}>
        <View style={styles.telegramHeader}>
          <View style={[styles.statusIcon, { backgroundColor: telegramReady ? theme.successBg : theme.tintSoft }]}>
            <Icon name={telegramReady ? 'check-circle' : 'send'} size={19} color={telegramReady ? theme.success : theme.tint} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle">Telegram bid alerts</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {telegramReady
                ? 'A chat ID is saved. Send a test any time to confirm the bot can still reach you.'
                : 'Connect Telegram to get a message when a vendor bids on your brief.'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.steps}>
          <SetupStep number="1" title="Get your chat ID" body="Open @userinfobot, copy the numeric ID, then paste it below." />
          <SetupStep
            number="2"
            title="Start the Briefly bot"
            body={botUsername ? `Open @${botUsername} and press Start.` : 'Open the Briefly bot and press Start.'}
          />
          <SetupStep number="3" title="Send a test" body="The test saves your chat ID first, then asks Telegram to deliver a sample message." />
        </View>

        <View style={styles.actionGrid}>
          <Button title="Open @userinfobot" variant="secondary" iconRight="external-link" onPress={openUserInfoBot} style={styles.actionButton} />
          <Button
            title={botUsername ? `Open @${botUsername}` : 'Find Briefly bot'}
            variant="secondary"
            iconRight="send"
            loading={saving === 'bot'}
            onPress={openBrieflyBot}
            style={styles.actionButton}
          />
        </View>
      </Card>

      <TextField
        label="Telegram chat ID"
        value={telegram}
        onChangeText={setTelegramDraft}
        placeholder="Paste the ID from @userinfobot"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        hint={hasUnsavedTelegram ? 'Unsaved ID. The test button will save it before sending.' : undefined}
      />
      <Button
        title={telegramReady ? 'Send test message' : 'Save and send test'}
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

function SetupStep({ number, title, body }: { number: string; title: string; body: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNumber, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold" style={{ color: theme.textSecondary }}>
          {number}
        </ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="muted">
          {body}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: { flex: 1, minWidth: 180 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  steps: { gap: Spacing.two },
  telegramHeader: { flexDirection: 'row', gap: Spacing.three, alignItems: 'flex-start' },
});
