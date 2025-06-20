import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiX, FiUpload } from "react-icons/fi";
import { RiSaveLine, RiArrowLeftLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

// Google Maps
import { LoadScript, Autocomplete } from "@react-google-maps/api";

// React Select
import Select from "react-select/async";
import CreatableSelect from "react-select/creatable";

// API
import {
  fetchUserProfile,
  updateProfile,
  getMaritalStatuses,
  getOccupations,
  getDenominations,
  getInterests,
} from "../../api/profile";
import { deleteVideo, uploadImage, uploadVideo } from "../../api/upload";
import useUserProfileStore from "../../store/user";

const libraries = ["places"];
const API_URL = import.meta.env.VITE_API_URL;

const EditProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [autocomplete, setAutocomplete] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  // Main form data
  const [formData, setFormData] = useState({
    fullName: "",
    about: "",
    location: "",
    occupation: null,
    churchDenomination: null,
    maritalStatus: null,
    dateOfBirth: "",
    gender: "",
    interests: [],
  });

  // Store originals so we can detect changes
  const [originalValues, setOriginalValues] = useState({});

  // Photos (up to 5) + default index
  const [photos, setPhotos] = useState([]);
  const [defaultPhotoIndex, setDefaultPhotoIndex] = useState(0);

  // Fetch user profile
  const {
    data: profile,
    isLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUserProfile,
    enabled: !!localStorage.getItem("authToken"),
  });

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(profile?.videoUrl || "");
  const { userProfile } = useUserProfileStore();

  // Async load function for marital statuses
  const loadMaritalStatuses = async (inputValue) => {
    try {
      const data = await getMaritalStatuses();
      let options = data
        .filter((status) =>
          status.name.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((item) => ({
          value: item._id,
          label: item.name,
        }));
      const idx = options.findIndex((opt) => opt.label === "Single");
      if (idx > -1) {
        const [single] = options.splice(idx, 1);
        options.unshift(single);
      }
      return options;
    } catch (error) {
      console.error("Error loading marital statuses:", error);
      return [];
    }
  };

  // Fetch occupations (for CreatableSelect)
  const { data: rawOccupations, refetch } = useQuery({
    queryKey: ["occupations"],
    queryFn: getOccupations,
  });

  // Fetch denominations (for CreatableSelect)
  const { data: rawDenominations, refetch: refetchDenomationQuery } = useQuery({
    queryKey: ["denominations"],
    queryFn: getDenominations,
  });

  // Fetch interests
  const { data: rawInterests } = useQuery({
    queryKey: ["interests"],
    queryFn: getInterests,
  });

  // Flatten the interests from categories
  const [allInterests, setAllInterests] = useState([]);
  useEffect(() => {
    if (rawInterests) {
      // Flatten { category, interests: [{ name, icon }] } into { value, label } array
      const flattened = [];
      rawInterests.forEach((cat) => {
        cat.interests.forEach((intr) => {
          flattened.push({ value: intr.name, label: intr.name });
        });
      });
      setAllInterests(flattened);
    }
  }, [rawInterests]);

  // Once we have the profile, populate our local state
  useEffect(() => {
    if (!profile || !rawOccupations || !rawDenominations) return;

    if (profile?.videoUrl) {
      setVideoUrl(profile.videoUrl);
    }
    setFormData((prev) => ({
      ...prev,
      fullName: profile.fullName || "",
      about: profile.about || "",
      location: profile.location || "",
      dateOfBirth: profile.dateOfBirth || "",
      gender: profile.gender || "",
      occupation:
        prev.occupation && prev.occupation.value !== profile.occupation
          ? prev.occupation // ✅ Keep newly selected value
          : rawOccupations?.find(
              (o) => o.title.toLowerCase() === profile.occupation?.toLowerCase()
            )
          ? {
              value: rawOccupations.find(
                (o) =>
                  o.title.toLowerCase() === profile.occupation?.toLowerCase()
              )._id,
              label: profile.occupation,
            }
          : profile.occupation
          ? { value: profile.occupation, label: profile.occupation }
          : null,

      churchDenomination:
        prev.churchDenomination &&
        prev.churchDenomination.value !== profile.churchDenomination
          ? prev.churchDenomination // ✅ Keep newly selected value
          : rawDenominations?.find(
              (d) =>
                d.name.toLowerCase() ===
                profile.churchDenomination?.toLowerCase()
            )
          ? {
              value: rawDenominations.find(
                (d) =>
                  d.name.toLowerCase() ===
                  profile.churchDenomination?.toLowerCase()
              )._id,
              label: profile.churchDenomination,
            }
          : profile.churchDenomination
          ? {
              value: profile.churchDenomination,
              label: profile.churchDenomination,
            }
          : null,

      maritalStatus:
        prev.maritalStatus && prev.maritalStatus.value !== profile.maritalStatus
          ? prev.maritalStatus
          : profile.maritalStatus
          ? {
              value: profile.maritalStatus._id || profile.maritalStatus,
              label: profile.maritalStatus.name || profile.maritalStatus,
            }
          : null,

      interests:
        prev.interests.length > 0
          ? prev.interests // ✅ Preserve manually added interests
          : (profile.interests || []).map((intr) => ({
              value: intr,
              label: intr,
            })),
    }));

    if (profile.photos?.length > 0) {
      setPhotos(profile.photos.slice(0, 5));
      setDefaultPhotoIndex(0);
    }
  }, [profile, rawOccupations, rawDenominations]);

  // Age display helper
  const calculateAge = (DOBString) => {
    if (!DOBString) return "";
    const today = new Date();
    const birthDate = new Date(DOBString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} years old`;
  };

  // Photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (photos.length >= 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadImage(fd);
      setPhotos((prev) => [...prev, result.url]);
    } catch (error) {
      toast.error("Failed to upload photo");
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (defaultPhotoIndex === index) {
      setDefaultPhotoIndex(0);
    } else if (defaultPhotoIndex > index) {
      setDefaultPhotoIndex((prev) => prev - 1);
    }
  };

  // Google Autocomplete
  const onPlaceChanged = () => {
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setCoordinates({ type: "Point", coordinates: [lng, lat] });
    setFormData((prev) => ({
      ...prev,
      location: place.formatted_address,
      locationCoordinates: {
        type: "Point",
        coordinates: [lng, lat],
      },
    }));
  };

  // Mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Before fix: return updateProfile(profile._id, data);
      return updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["profile"]);
      toast.dismiss();
      toast.success("Profile updated successfully");
      navigate("/profile");
    },
    onError: (err) => {
      toast.dismiss();
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update profile";
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      // clear local preview
      setVideoUrl("");
      // refresh profile so store no longer has videoUrl
      queryClient.invalidateQueries(["profile"]);
      toast.success("Video deleted successfully. Please save your changes.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete video");
    },
  });

  // Submit
  // ... inside your EditProfile component ...

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (photos.length < 1) {
      toast.dismiss();
      toast.error("Please upload at least one photo");
      return;
    }

    // Reorder photos so default is front
    const reordered = [...photos];
    const [defaultPic] = reordered.splice(defaultPhotoIndex, 1);
    reordered.unshift(defaultPic);

    const finalData = {
      ...formData,
      videoUrl,
      photos: reordered,
      occupation: formData.occupation?.value ?? originalValues.occupation,
      churchDenomination:
        formData.churchDenomination?.value ?? originalValues.churchDenomination,
      maritalStatus: formData.maritalStatus?.value ?? formData.maritalStatus,
      interests: (formData.interests || []).map((intr) => intr.value),
    };

    // --------------------------------------------------------------------------
    // Convert string occupation/denomination to the matching _id if found
    // --------------------------------------------------------------------------
    if (typeof finalData.occupation === "string") {
      const foundOcc = rawOccupations?.find(
        (o) => o.title.toLowerCase() === finalData.occupation.toLowerCase()
      );
      if (foundOcc) {
        finalData.occupation = foundOcc._id;
      }
    }

    if (typeof finalData.churchDenomination === "string") {
      const foundDen = rawDenominations?.find(
        (d) =>
          d.name.toLowerCase() === finalData.churchDenomination.toLowerCase()
      );
      if (foundDen) {
        finalData.churchDenomination = foundDen._id;
      }
    }

    if (typeof finalData.maritalStatus === "string") {
      const foundStatus = await getMaritalStatuses();
      const matchedStatus = foundStatus.find(
        (status) =>
          status.name.toLowerCase() === finalData.maritalStatus.toLowerCase()
      );
      if (matchedStatus) {
        finalData.maritalStatus = matchedStatus._id;
      }
    }
    // --------------------------------------------------------------------------

    updateMutation.mutate(finalData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }
  if (profileError) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error loading profile: {profileError.message}
      </div>
    );
  }

  // Helper: create new occupation
  const handleCreateOccupation = async (inputValue) => {
    try {
      const response = await fetch(`${API_URL}/occupations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: inputValue }),
      });
      if (!response.ok) {
        throw new Error("Failed to create new occupation");
      }
      const newOcc = await response.json();

      const newOption = { value: newOcc._id, label: newOcc.title };

      setFormData((prev) => ({ ...prev, occupation: newOption }));

      queryClient.setQueryData(["occupations"], (oldData) =>
        oldData ? [...oldData, newOcc] : [newOcc]
      );

      await refetch();

      toast.success(`Occupation "${inputValue}" created successfully!`);
      return newOption;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  // Helper: create new denomination
  const handleCreateDenomination = async (inputValue) => {
    try {
      const response = await fetch(`${API_URL}/denominations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue }),
      });
      if (!response.ok) {
        throw new Error("Failed to create new denomination");
      }
      const newDen = await response.json();
      await refetchDenomationQuery();
      const newOption = { value: newDen._id, label: newDen.name };
      setFormData((prev) => ({ ...prev, churchDenomination: newOption }));
      // Notify user on success
      toast.success(`Denomination "${inputValue}" created successfully!`);
      return newOption;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check subscription status
    if (userProfile?.subscriptionStatus !== "premium") {
      toast.error("Video uploads are available for premium users only.");
      return;
    }

    // Check video size (e.g., max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size must be under 50MB.");
      return;
    }

    const fd = new FormData();
    fd.append("video", file);

    setVideoUploading(true);
    try {
      const result = await uploadVideo(fd);
      setVideoUrl(result.url);
      toast.success("Video uploaded successfully. Please save your changes.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleDeleteVideo = async () => {
    deleteMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto py-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/profile")}
                className="p-2 rounded-xl bg-white shadow-sm"
              >
                <RiArrowLeftLine className="w-6 h-6" />
              </motion.button>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo Management */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Photos (Max 5)</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className={`object-cover w-full h-full rounded-md ${
                        index === defaultPhotoIndex
                          ? "ring-4 ring-purple-400"
                          : ""
                      }`}
                    />
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <FiX />
                    </button>
                    {/* Make default if not default */}
                    {index !== defaultPhotoIndex && (
                      <button
                        type="button"
                        className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 text-sm rounded"
                        onClick={() => setDefaultPhotoIndex(index)}
                      >
                        Make Default
                      </button>
                    )}
                    {index === defaultPhotoIndex && (
                      <span className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-0.5 text-sm rounded">
                        Default
                      </span>
                    )}
                  </div>
                ))}

                {/* If we have fewer than 5 photos, show an upload button */}
                {photos.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-purple-400 rounded-md flex items-center justify-center cursor-pointer hover:bg-purple-50">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <FiUpload className="text-2xl text-purple-500" />
                  </label>
                )}
              </div>
            </section>

            <section className="bg-white rounded-2xl p-8 shadow-sm space-y-4">
              <h2 className="text-2xl font-bold">Profile Video</h2>
              {userProfile?.subscriptionStatus === "premium" ? (
                <div>
                  {videoUrl && (
                    <video
                      src={videoUrl}
                      controls
                      className="mb-4 rounded-sm max-w-xs w-full"
                    />
                  )}
                  <div className="flex gap-2 items-stretch">
                    {videoUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteVideo}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending
                          ? "Deleting…"
                          : "Delete Video"}
                      </button>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-2 py-2 px-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition">
                      <input
                        type="file"
                        accept="video/mp4,video/mov,video/webm"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      {videoUploading ? (
                        <span>Uploading...</span>
                      ) : (
                        <>
                          <FiUpload />{" "}
                          {videoUrl ? "Replace Video" : "Upload Video"}
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Note:</strong> Max size:{" "}
                    <span className="font-medium">50MB</span>, Max duration:{" "}
                    <span className="font-medium">60 seconds</span>, Allowed
                    formats: <span className="font-medium">MP4, MOV, WEBM</span>
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                  Upgrade to Premium to upload a profile video.
                </div>
              )}
            </section>

            {/* Basic Information */}
            <section className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold">Basic Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Date of Birth => display as age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={calculateAge(formData.dateOfBirth)}
                    readOnly
                    className="w-full px-4 py-2 rounded-xl border bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <input
                    type="text"
                    value={formData.gender}
                    readOnly
                    className="w-full px-4 py-2 rounded-xl border bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Location => Google Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                  >
                    <Autocomplete
                      onLoad={setAutocomplete}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Enter your location"
                        className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </Autocomplete>
                  </LoadScript>
                </div>

                {/* Occupation => CreatableSelect */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Occupation
                  </label>
                  <CreatableSelect
                    placeholder="Select or create an occupation"
                    // Ensure the current selection is shown
                    value={formData.occupation}
                    onChange={(newValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        occupation: newValue, // immediately store in formData
                      }))
                    }
                    onCreateOption={async (inputValue) => {
                      try {
                        // Create via your existing helper
                        const newOcc = await handleCreateOccupation(inputValue);
                        // Immediately select the newly created occupation
                        setFormData((prev) => ({
                          ...prev,
                          occupation: newOcc,
                        }));
                        return newOcc;
                      } catch (error) {
                        // handleCreateOccupation already shows toast on error
                        return null;
                      }
                    }}
                    // Use mapped rawOccupations for options
                    options={
                      rawOccupations
                        ? rawOccupations.map((occ) => ({
                            value: occ._id,
                            label: occ.title,
                          }))
                        : []
                    }
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Church Denomination => CreatableSelect */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Church Denomination
                  </label>
                  <CreatableSelect
                    placeholder="Select or create a denomination"
                    // Ensure the current selection is shown
                    value={formData.churchDenomination}
                    onChange={(newValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        churchDenomination: newValue,
                      }))
                    }
                    onCreateOption={async (inputValue) => {
                      try {
                        const newDen = await handleCreateDenomination(
                          inputValue
                        );
                        // Immediately select the newly created denomination
                        setFormData((prev) => ({
                          ...prev,
                          churchDenomination: newDen,
                        }));
                        return newDen;
                      } catch (error) {
                        // handleCreateDenomination shows toast on error
                        return null;
                      }
                    }}
                    // Use mapped rawDenominations for options
                    options={
                      rawDenominations
                        ? rawDenominations.map((den) => ({
                            value: den._id,
                            label: den.name,
                          }))
                        : []
                    }
                    isClearable
                    classNamePrefix="react-select"
                  />
                </div>

                {/* Marital Status => async Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <Select
                    cacheOptions
                    loadOptions={loadMaritalStatuses}
                    defaultOptions
                    placeholder="Select your status"
                    value={formData.maritalStatus} // { value, label } with value = the_Actual_ID
                    onChange={(selected) => {
                      setFormData((prev) => ({
                        ...prev,
                        maritalStatus: selected, // Store { value: "605c...", label: "Single" }
                      }));
                    }}
                    classNamePrefix="react-select"
                  />
                </div>
              </div>

              {/* About Me */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Me
                </label>
                <textarea
                  value={formData.about}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, about: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </section>

            {/* Interests => isMulti CreatableSelect */}
            <section className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Interests</h2>
              <CreatableSelect
                isMulti
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select or type your interests"
                /* Show the current selected interests from formData */
                value={formData.interests}
                /* The full list of interests to choose from (flattened categories) */
                options={allInterests}
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    interests: selected || [],
                  }));
                }}
                onCreateOption={async (inputValue) => {
                  try {
                    // POST a new interest to your interests endpoint
                    const response = await fetch(`${API_URL}/interests`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: inputValue }),
                    });
                    if (!response.ok) {
                      throw new Error("Failed to create new interest");
                    }

                    // Parse the entire returned object
                    const data = await response.json();
                    // The actual interest name is likely in data.interests[0].name
                    const interestName =
                      data?.interests?.[0]?.name || inputValue;

                    // Build our new option using the interest name
                    const newOption = {
                      value: interestName,
                      label: interestName,
                      isCustom: true,
                    };

                    // Update the allInterests list to include our brand-new option
                    setAllInterests((prev) => [...prev, newOption]);

                    // Immediately select it in formData.interests
                    setFormData((prev) => ({
                      ...prev,
                      interests: [...(prev.interests || []), newOption],
                    }));

                    toast.success(
                      `Interest "${interestName}" created and selected!`
                    );
                    return newOption;
                  } catch (err) {
                    console.error("Error creating interest:", err);
                    toast.error("Failed to add interest. Please try again.");
                    return null;
                  }
                }}
              />
            </section>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>

              <motion.button
                type="submit"
                disabled={updateMutation.isLoading}
                className={`flex-1 py-4 ${
                  updateMutation.isLoading ? "bg-purple-400" : "bg-purple-600"
                } text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-700`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RiSaveLine className="w-5 h-5" />
                {updateMutation.isLoading ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}; // Close the EditProfile component

export default EditProfile;
