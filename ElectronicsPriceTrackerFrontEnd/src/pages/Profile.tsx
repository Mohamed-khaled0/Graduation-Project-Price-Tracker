import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { AppRole } from "@/contexts/auth/types/user-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvatarUpload from "@/components/profile/AvatarUpload";
import ProfileForm from "@/components/profile/ProfileForm";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { assignRole, removeRole, fetchUserRoles } from '@/contexts/auth/authUtils';

const Profile: React.FC = () => {
  const { user, profile, setProfile, signOut } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [tempAvatarUrl, setTempAvatarUrl] = useState(profile?.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || "");
      setTempAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user?.id) return;
    fetchUserRoles(user.id).then(setRoles);
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      if (!user) {
        toast.error("You must be logged in to update your profile");
        return;
      }

      if (!username.trim()) {
        toast.error("Username cannot be empty");
        return;
      }

      const updates = {
        id: user.id,
        username: username.trim(),
        avatar_url: tempAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to update profile");
      }

      // Update the profile in the context
      const updatedProfile = { ...profile, username: username.trim(), avatar_url: tempAvatarUrl };
      setProfile(updatedProfile);
      setUsername(updatedProfile.username);
      setAvatarUrl(tempAvatarUrl);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);
      if (!user) {
        toast.error("You must be logged in to upload an avatar");
        return;
      }

      // Make sure the file path includes the user ID to match the storage policy
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      // First, try to delete the old avatar if it exists
      if (tempAvatarUrl) {
        const oldPath = tempAvatarUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload the new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload avatar");
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setTempAvatarUrl(publicUrl);
      toast.success("Avatar uploaded successfully! Click 'Update Profile' to save changes.");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const deleteUser = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to delete your account");
        return;
      }

      const { error } = await supabase.from("profiles").delete().eq("id", user.id);

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to delete user");
      }

      await signOut();
      toast.success("User deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    }
  };

  const handleAssign = async (userId: string, role: AppRole) => {
    try {
      const updatedRoles = await assignRole(userId, role);
      // update UI with updatedRoles
    } catch (e) {}
  };

  const handleRemove = async (userId: string, role: AppRole) => {
    try {
      const updatedRoles = await removeRole(userId, role);
      // update UI with updatedRoles
    } catch (e) {}
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Profile Settings
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Manage your profile information here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <AvatarUpload 
                avatarUrl={tempAvatarUrl} 
                onAvatarChange={handleAvatarChange} 
                uploading={uploading}
                setUploading={setUploading}
                username={username}
                email={user?.email}
              />
            </div>
            <Separator />
            <ProfileForm
              username={username}
              setUsername={setUsername}
              updateProfile={updateProfile}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
