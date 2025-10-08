import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, User, Loader2 } from "lucide-react";
import { uploadAvatar, getAvatarUrl } from "@/services/avatarService";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadComplete?: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload = ({ 
  userId, 
  currentAvatarUrl, 
  onUploadComplete,
  size = 'md' 
}: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Vous devez sélectionner une image');
      }

      const file = event.target.files[0];
      
      const result = await uploadAvatar(userId, file);

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors du téléchargement');
      }

      if (result.url) {
        setAvatarUrl(result.url);
        toast.success('Avatar mis à jour avec succès');
        
        if (onUploadComplete) {
          onUploadComplete(result.url);
        }
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = getAvatarUrl(avatarUrl);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-aurentia-pink to-orange-500 flex items-center justify-center relative group`}>
        {displayUrl ? (
          <img 
            src={displayUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={iconSizes[size]} className="text-white" />
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload size={iconSizes[size] / 2} className="text-white" />
        </div>
      </div>

      <div className="w-full max-w-xs">
        <Label htmlFor="avatar-upload" className="cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Téléchargement...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span className="text-sm">Changer l'avatar</span>
              </>
            )}
          </div>
        </Label>
        <Input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2 text-center">
          JPG, PNG ou GIF (max. 2MB)
        </p>
      </div>
    </div>
  );
};
