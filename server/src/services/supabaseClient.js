const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to upload a file to Supabase Storage bucket
 * @param {string} bucket - Bucket name (e.g. 'attachments', 'avatars')
 * @param {string} filePath - Path inside the bucket
 * @param {Buffer} fileBuffer - Binary content of file
 * @param {string} contentType - MIME type
 */
async function uploadToStorage(bucket, filePath, fileBuffer, contentType) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error(`Erro ao fazer upload no Supabase Storage (${bucket}/${filePath}):`, err);
    throw err;
  }
}

module.exports = {
  supabase,
  uploadToStorage
};
