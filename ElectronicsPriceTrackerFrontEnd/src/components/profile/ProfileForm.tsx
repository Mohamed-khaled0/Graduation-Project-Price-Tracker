import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormProps {
  username: string;
  setUsername: (username: string) => void;
  updateProfile: () => Promise<void>;
  loading: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  username,
  setUsername,
  updateProfile,
  loading
}) => {
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);
    
    // Check if more than 2 words
    if (words.length > 2) {
      toast.error("Username can only contain up to 2 words");
      return;
    }
    
    // Check if total length exceeds 20 characters
    if (value.length > 20) {
      toast.error("Username cannot exceed 20 characters");
      return;
    }
    
    setUsername(value);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your username (max 2 words, 20 chars)"
          value={username}
          onChange={handleUsernameChange}
          maxLength={20}
        />
        <p className="text-sm text-gray-500">
          Maximum 2 words and 20 characters
        </p>
      </div>
      <div className="flex justify-between w-full">
        <Button variant="destructive" onClick={() => {}}>
          Sign Out
        </Button>
        <Button onClick={updateProfile} disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </>
  );
};

export default ProfileForm;
