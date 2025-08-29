const base64ToFileOrNull = (
  input: string | File | null | undefined,
  fileNameWithoutExtension: string
): File | null => {
  if (!input) return null;

  if (input instanceof File) return input;

  if (typeof input !== 'string') return null;

  const [meta, base64Data] = input.split(',');
  if (!meta || !base64Data) return null;

  const mimeMatch = meta.match(/:(.*?);/);
  if (!mimeMatch) return null;

  const mime = mimeMatch[1];
  const ext = mime.split('/')[1] || 'bin';

  let bstr: string;
  try {
    bstr = atob(base64Data);
  } catch (e) {
    console.error("Error decoding base64 string:", e);
    return null;
  }

  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  const fileName = `${fileNameWithoutExtension || 'file_' + Date.now()}`;
  return new File([u8arr], fileName, { type: mime });
};


export default base64ToFileOrNull;
