import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const STORAGE_BUCKET_TENDER_DOCS = 'tender-documents';
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const storageService = {
  validateFile(file: File): FileValidationResult {
    if (!file || file.size === 0) {
      return { valid: false, error: 'File is empty. Please select a valid document.' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: 'File must be smaller than 10 MB.' };
    }

    const name = file.name.toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));

    if (!hasValidExt) {
      return {
        valid: false,
        error: `Invalid file format. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}`,
      };
    }

    return { valid: true };
  },

  async uploadRequiredDocument(
    tenderId: string,
    documentId: string,
    file: File
  ): Promise<{ storagePath: string; fileUrl: string }> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `tenders/${tenderId}/required-documents/${documentId}/${sanitizedName}`;

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET_TENDER_DOCS)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (error) {
          console.warn('Supabase storage upload error:', error);
        } else {
          const secureUrl = await this.getSecureUrl(storagePath);
          return { storagePath, fileUrl: secureUrl };
        }
      } catch (err) {
        console.warn('Supabase storage exception:', err);
      }
    }

    // Local / In-memory simulated storage fallback
    const simulatedUrl = `/docs/tenders/${tenderId}/${sanitizedName}`;
    return {
      storagePath,
      fileUrl: simulatedUrl,
    };
  },

  async deleteRequiredDocument(storagePath: string): Promise<boolean> {
    if (!storagePath) return true;

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET_TENDER_DOCS)
          .remove([storagePath]);

        if (error) {
          console.warn('Supabase storage delete error:', error);
          return false;
        }
        return true;
      } catch (err) {
        console.warn('Supabase storage delete exception:', err);
        return false;
      }
    }

    return true;
  },

  async getSecureUrl(storagePath: string): Promise<string> {
    if (!storagePath) return '';

    if (isSupabaseConfigured()) {
      try {
        // Authenticated/private signed URL valid for 1 hour
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET_TENDER_DOCS)
          .createSignedUrl(storagePath, 3600);

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      } catch (err) {
        console.warn('Failed to generate signed URL:', err);
      }
    }

    return `/docs/${storagePath}`;
  },
};
