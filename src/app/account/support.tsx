import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/AuthContext';

export default function AccountSupport() {
  const toast = useToast();
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function send() {
    if (!user) return;
    if (!subject.trim() || !message.trim()) {
      toast.error('Add both a subject and a message.');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('support_requests').insert({
        user_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
      });
      if (error) throw error;
      setSubject('');
      setMessage('');
      toast.success('Support request sent. We&apos;ll be in touch.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send your request.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      showBack
      showHome
      eyebrow="Account"
      title="Help & support"
      subtitle="Tell us what's going on and we'll follow up."
      footer={<Button title="Send request" iconRight="send" loading={saving} onPress={send} />}>
      <TextField label="Subject" value={subject} onChangeText={setSubject} placeholder="Payment question" />
      <TextField
        label="Message"
        value={message}
        onChangeText={setMessage}
        placeholder="Tell us what happened."
        multiline
      />
    </Screen>
  );
}
