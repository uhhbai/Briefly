/**
 * Pick an image from the device and upload it to the public `vendor-media`
 * Supabase Storage bucket. Returns the public URL, or null if the user
 * cancelled. Throws with a readable message on a real failure.
 */

import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

const BUCKET = 'vendor-media';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Decode a base64 string into raw bytes without relying on atob/Buffer. */
function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = clean.length;
  const remainder = len % 4;
  const bytesLen = Math.floor(len / 4) * 3 + (remainder === 3 ? 2 : remainder === 2 ? 1 : 0);
  const bytes = new Uint8Array(bytesLen);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const e1 = B64.indexOf(clean[i]);
    const e2 = B64.indexOf(clean[i + 1]);
    const e3 = B64.indexOf(clean[i + 2]);
    const e4 = B64.indexOf(clean[i + 3]);
    bytes[p++] = (e1 << 2) | (e2 >> 4);
    if (e3 !== -1) bytes[p++] = ((e2 & 15) << 4) | (e3 >> 2);
    if (e4 !== -1) bytes[p++] = ((e3 & 3) << 6) | e4;
  }
  return bytes;
}

function extFromMime(mime: string | undefined): string {
  if (!mime) return 'jpg';
  if (mime.includes('png')) return 'png';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('heic')) return 'heic';
  return 'jpg';
}

/**
 * Launch the photo library, upload the chosen image, and return its public URL.
 * @param folder sub-path inside the bucket, e.g. 'logos' or 'services'
 */
export async function pickAndUploadImage(folder: string): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo access was denied. Enable it in Settings to upload images.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.8,
    base64: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.base64) throw new Error('Could not read the selected image.');

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('You need to be logged in to upload images.');

  const ext = extFromMime(asset.mimeType);
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
  const bytes = base64ToBytes(asset.base64);

  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes.buffer as ArrayBuffer, {
    contentType: asset.mimeType ?? 'image/jpeg',
    upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
