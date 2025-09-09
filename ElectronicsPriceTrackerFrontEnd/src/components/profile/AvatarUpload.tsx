import React, { useState, useEffect } from "react";
import { Camera, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AvatarUploadProps {
  avatarUrl: string;
  onAvatarChange: (file: File | null) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  username?: string;
  email?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  avatarUrl, 
  onAvatarChange, 
  uploading,
  setUploading,
  username, 
  email 
}) => {
  const [avatarLoading, setAvatarLoading] = useState<"loading" | "loaded" | "error">("loading");
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    // Reset loading state when avatarUrl changes
    if (!avatarUrl || avatarUrl.trim() === "") {
      setAvatarLoading("error");
      setHasAttemptedLoad(false);
    }
  }, [avatarUrl]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
    }
    onAvatarChange(file);
  };

  const handleAvatarLoadingChange = (status: "loading" | "loaded" | "error") => {
    setAvatarLoading(status);
    setHasAttemptedLoad(true);
    
    // Only show error if we have attempted to load an avatar and it failed
    if (status === "error" && hasAttemptedLoad && avatarUrl && avatarUrl.trim() !== "") {
      toast.warning("Failed to load avatar image. The URL might be invalid.");
    }
  };

  const getFirstLetter = () => {
    return username?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Dialog open={showAvatarPreview} onOpenChange={setShowAvatarPreview}>
        <DialogTrigger asChild>
          <Avatar className="w-32 h-32 cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition-all">
            {avatarUrl && avatarUrl.trim() !== "" ? (
              <AvatarImage 
                src={avatarUrl} 
                alt="Avatar" 
                onLoadingStatusChange={handleAvatarLoadingChange} 
              />
            ) : null}
            <AvatarFallback>
              {avatarLoading === "loading" && avatarUrl && avatarUrl.trim() !== "" ? (
                <div className="animate-pulse h-full w-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Loading...</span>
                </div>
              ) : (
                getFirstLetter()
              )}
            </AvatarFallback>
          </Avatar>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <img 
              src={avatarUrl} 
              alt="Avatar preview" 
              className="max-w-full max-h-[500px] rounded-md" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=No+Image";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex items-center space-x-2">
        <label
          htmlFor="avatar-upload"
          className="cursor-pointer hover:text-blue-500 transition-colors duration-200 flex items-center py-2 px-3 bg-white border border-gray-300 rounded-md shadow-sm"
        >
          {uploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Change Avatar
            </>
          )}
        </label>
        <Input
          type="file"
          id="avatar-upload"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={uploading}
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
