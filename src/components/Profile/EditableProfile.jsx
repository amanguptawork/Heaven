import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RiEditFill, RiSaveLine, RiImageAddLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { fetchUserProfile, updateProfile } from "../../api/profile";

const EditableProfile = ({ userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    churchDenomination: "",
    maritalStatus: "",
    interests: [],
    occupation: "",
    about: "",
    photos: [],
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchUserProfile(userId),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedData) => updateProfile(userId, updatedData),
    onSuccess: () => {
      toast.dismiss();
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: () => {
      toast.dismiss();
      toast.error("Failed to update profile");
    },
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    // Implement photo upload logic here
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-700"
        >
          {isEditing ? (
            <>
              <RiSaveLine /> Save Changes
            </>
          ) : (
            <>
              <RiEditFill /> Edit Profile
            </>
          )}
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photos Section */}
        <div className="grid grid-cols-3 gap-4">
          {formData.photos.map((photo, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl overflow-hidden"
            >
              <img
                src={photo}
                alt={`Profile ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {isEditing && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <RiImageAddLine className="w-8 h-8 text-gray-400" />
            </label>
          )}
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {/* Add other fields similarly */}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">About</label>
          <textarea
            disabled={!isEditing}
            value={formData.about}
            onChange={(e) =>
              setFormData({ ...formData, about: e.target.value })
            }
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 h-32"
          />
        </div>
      </form>
    </div>
  );
};

export default EditableProfile;
