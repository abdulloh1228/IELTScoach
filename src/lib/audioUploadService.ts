import { supabase } from './supabase';

export interface AudioFile {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number;
  createdAt: string;
}

export async function uploadAudio(
  file: File,
  title: string,
  description?: string
): Promise<AudioFile> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const timestamp = Date.now();
  const fileName = `${user.id}/${timestamp}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('listening-audios')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('listening-audios')
    .getPublicUrl(uploadData.path);

  const duration = await getAudioDuration(file);

  const { data: audioRecord, error: dbError } = await supabase
    .from('listening_audios')
    .insert({
      user_id: user.id,
      title,
      description,
      audio_url: publicUrl,
      duration: Math.round(duration),
    })
    .select()
    .maybeSingle();

  if (dbError) throw dbError;

  return {
    id: audioRecord.id,
    title: audioRecord.title,
    description: audioRecord.description,
    audioUrl: audioRecord.audio_url,
    duration: audioRecord.duration,
    createdAt: audioRecord.created_at,
  };
}

export async function getUserAudios(): Promise<AudioFile[]> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('listening_audios')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(audio => ({
    id: audio.id,
    title: audio.title,
    description: audio.description,
    audioUrl: audio.audio_url,
    duration: audio.duration,
    createdAt: audio.created_at,
  }));
}

export async function deleteAudio(audioId: string): Promise<void> {
  const { error } = await supabase
    .from('listening_audios')
    .delete()
    .eq('id', audioId);

  if (error) throw error;
}

function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    const onLoadedMetadata = () => {
      URL.revokeObjectURL(url);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      resolve(audio.duration);
    };

    const onError = () => {
      URL.revokeObjectURL(url);
      audio.removeEventListener('error', onError);
      reject(new Error('Failed to load audio file'));
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);
    audio.src = url;
  });
}
