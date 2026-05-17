'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  multiple?: boolean;
}

export function ImageUpload({ bucket, path, onUploadComplete, multiple = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = event.target.files;
      if (!files) return;

      const fileArray = multiple ? Array.from(files) : [files[0]];
      const uploadedUrls: string[] = [];

      for (const file of fileArray) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        
        if (!multiple) {
          onUploadComplete(publicUrl);
        }
      }

      if (multiple) {
        onUploadComplete(uploadedUrls.join(','));
      }

      setPreviews(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        <Upload className="w-4 h-4 mr-2" />
        {uploading ? 'Uploading...' : 'Upload Image'}
        <input
          type="file"
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}