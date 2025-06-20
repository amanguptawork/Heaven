import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Select from "react-select/async";
import { toast } from "react-hot-toast";
import { FiUpload, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Local imports
import {
  getMaritalStatuses,
  getOccupations,
  getInterests,
} from "../../../api/profile";
import { uploadImage } from "../../../api/upload";
import { sendVerificationEmail } from "../../../api/auth";
import { useRegisterStore } from "../../../store/registerStore";
import { register as registerEndpoint } from "../../../api/auth";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import axiosInstance from "../../../api/axios";

const API_URL = import.meta.env.VITE_API_URL;

export const StepFour = ({ onNext, onBack }) => {
  // First get formData from store
  const formData = useRegisterStore((state) => state.formData);
  const navigate = useNavigate(); // Hook for navigation

  // Additional local states
  const [photos, setPhotos] = useState(formData.photos || []);
  const [isLoading, setIsLoading] = useState(false);
  const [occupations, setOccupations] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [allInterests, setAllInterests] = useState([]);
  // Default photo index
  const [defaultPhotoIndex, setDefaultPhotoIndex] = useState(0);
  // Add these lines near the other useState hooks:
  const [occupationValue, setOccupationValue] = useState(
    formData.occupation || null
  );

  const [interestsValue, setInterestsValue] = useState(
    formData.interests
      ? formData.interests.map((i) => ({ label: i, value: i }))
      : []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      maritalStatus: formData.maritalStatus || "",
      occupation: formData.occupation || "",
      interests: formData.interests || [],
      about: formData.about || "",
      churchDenomination: formData.churchDenomination || "",
    },
  });

  // 1) Async loader for marital statuses
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

  // 3) Interests: replicate the same "creatable" logic as occupations
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const data = await getInterests();
        // Flatten data from the categories
        const flattenedInterests = data.reduce((acc, category) => {
          const interests = category.interests.map((interest) => ({
            value: interest.name,
            label: interest.name,
            icon: interest.icon,
            category: category.category,
          }));
          return [...acc, ...interests];
        }, []);
        setAllInterests(flattenedInterests);
      } catch (error) {
        console.error("Error fetching interests:", error);
      }
    };
    fetchInterests();
  }, []);

  // 4) Handle photo uploads (limit 5 images)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (photos.length >= 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }

    try {
      setIsLoading(true);
      const photoFormData = new FormData();
      photoFormData.append("file", file);
      const result = await uploadImage(photoFormData);
      setPhotos([...photos, result.url]);
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    // If removing the default photo, reset default index
    if (defaultPhotoIndex === index) {
      setDefaultPhotoIndex(0);
    } else if (defaultPhotoIndex > index) {
      setDefaultPhotoIndex(defaultPhotoIndex - 1);
    }
  };

  // On form submission
  const onSubmit = async (data) => {
    if (photos.length < 1) {
      toast.error("Please upload at least one photo");
      return;
    }

    try {
      setIsLoading(true);
      const allFormData = useRegisterStore.getState().formData;

      // Reorder photos so that the chosen default is first
      const reorderedPhotos = [...photos];
      const [defaultPic] = reorderedPhotos.splice(defaultPhotoIndex, 1);
      reorderedPhotos.unshift(defaultPic);

      // Format final data
      const formattedData = {
        ...allFormData,
        churchDenomination: allFormData.churchDenomination.value,
        maritalStatus: data.maritalStatus,
        occupation: data.occupation.value,
        about: data.about,
        interests: data.interests,
        photos: reorderedPhotos,
        profileCompleted: true,
      };

      console.log("Formatted registration data:", formattedData);

      const registerResponse = await registerEndpoint(formattedData);
      if (registerResponse) {
        await sendVerificationEmail({ email: allFormData.email });
        localStorage.setItem("verificationEmail", allFormData.email);
        navigate("/verify-email", { replace: true });
        toast.dismiss();
        toast.success("Registration successful! Please verify your email.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.dismiss();
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    register("maritalStatus", { required: "Marital status is required" });
    register("occupation", { required: "Occupation is required" });
    register("interests", { required: "Select at least one interest" });
  }, [register]);

  // Fetch occupations data
  useEffect(() => {
    const fetchOccupations = async () => {
      try {
        const data = await getOccupations();
        const formattedOccupations = data.map((occ) => ({
          value: occ._id,
          label: occ.title,
        }));
        setOccupations(formattedOccupations);
      } catch (error) {
        console.error("Error loading occupations:", error);
      }
    };
    fetchOccupations();
  }, []);

  // Instead of random user images, use HONE slideshow on the right
  const honeImages = [
    "/images/HONE 1.jpg",
    "/images/HONE 2.jpg",
    "/images/HONE 3.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate every ~6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % honeImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [honeImages]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Panel: scrollable form area */}
      <div className="w-full md:w-1/2 h-full flex flex-col overflow-y-auto bg-gradient-to-b from-pink-50/30 to-white pt-8">
        <div className="h-16 md:h-20 flex items-center pl-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6"></div>
            <img src="/honelogo.png" alt="HOEC Logo" className="h-[73px]" />
          </div>
        </div>

        <div className="flex-1 flex items-start">
          <div className="w-full max-w-[520px] pl-8 pr-8 md:pr-16 pb-16">
            <h1 className="font-fraunces text-4xl md:text-[46px] font-light text-primary leading-[1.2] mb-12">
              Complete your profile
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 1) Marital Status */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Marital Status
                </label>
                <Select
                  loadOptions={loadMaritalStatuses}
                  defaultOptions
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select your marital status"
                  onChange={(selected) => {
                    setValue("maritalStatus", selected?.value);
                  }}
                />
                {errors.maritalStatus && (
                  <span className="text-red-500 text-sm">
                    {errors.maritalStatus.message}
                  </span>
                )}
              </div>

              {/* 2) Occupation */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Occupation
                </label>
                <CreatableSelect
                  // Keep your existing register call
                  {...register("occupation", {
                    required: "Occupation is required",
                  })}
                  options={occupations}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select or type your occupation"
                  isClearable
                  isSearchable
                  // NEW: Control the value from state
                  value={occupationValue}
                  onChange={(selected) => {
                    setOccupationValue(selected);
                    setValue("occupation", selected);
                    setSuccessMessage("");
                  }}
                  onCreateOption={async (inputValue) => {
                    try {
                      const { data } = await axiosInstance.post(
                        "/occupations",
                        {
                          title: inputValue,
                        }
                      );
                      // Build the new option
                      const newOption = {
                        value: data._id,
                        label: inputValue,
                        isCustom: true,
                      };
                      // Add new option to local list
                      setOccupations((prev) => [...prev, newOption]);
                      // Immediately select it
                      setOccupationValue(newOption);
                      setValue("occupation", newOption);
                      setSuccessMessage(
                        `"${inputValue}" has been created and selected automatically.`
                      );
                      return newOption;
                    } catch (error) {
                      console.error("Error saving occupation:", error);
                      setSuccessMessage(
                        "Failed to add occupation. Please try again."
                      );
                    }
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: "48px",
                      borderWidth: "2px",
                      borderColor: "#17100E",
                      "&:hover": {
                        borderColor: "#17100E",
                      },
                    }),
                  }}
                />

                {successMessage && (
                  <div className="mt-2 text-sm text-green-600">
                    {successMessage}
                  </div>
                )}
                {errors.occupation && (
                  <span className="text-red-500 text-sm">
                    {errors.occupation.message}
                  </span>
                )}
              </div>

              {/* 3) Interests (Creatable + multi) */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Interests
                </label>
                <CreatableSelect
                  isMulti
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select or type your interests"
                  options={allInterests}
                  // NEW: Control the selected interests from state
                  value={interestsValue}
                  onChange={(selected) => {
                    setInterestsValue(selected);
                    const interestValues = selected
                      ? selected.map((item) => item.value)
                      : [];
                    setValue("interests", interestValues);
                  }}
                  onCreateOption={async (inputValue) => {
                    try {
                      // POST to your "interests" endpoint
                      const { data: createdInterest } =
                        await axiosInstance.post("/interests", {
                          name: inputValue,
                        });
                      const newOption = {
                        value: inputValue,
                        label: inputValue,
                        isCustom: true,
                      };
                      // Immediately add it to local array
                      setAllInterests((prev) => [...prev, newOption]);
                      // Also select it
                      setInterestsValue((prev) => [...prev, newOption]);
                      setValue("interests", (prevInterests) => [
                        ...prevInterests,
                        inputValue,
                      ]);
                      toast.dismiss();
                      toast.success(
                        `Interest "${inputValue}" created and selected!`
                      );
                      return newOption;
                    } catch (error) {
                      console.error("Error creating interest:", error);
                      toast.error("Failed to add interest. Please try again.");
                    }
                  }}
                />

                {errors.interests && (
                  <span className="text-red-500 text-sm">
                    {errors.interests.message}
                  </span>
                )}
              </div>

              {/* 4) About Me */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  About Me
                </label>
                <textarea
                  {...register("about", {
                    required: "Tell us about yourself",
                    minLength: {
                      value: 50,
                      message: "Please write at least 50 characters",
                    },
                  })}
                  className="w-full h-32 px-4 py-3 border-2 border-primary rounded-lg
                             font-inter text-base resize-none focus:outline-none focus:ring-2
                             focus:ring-primary transition-all duration-200"
                  placeholder="Share something about yourself..."
                />
                {errors.about && (
                  <span className="text-red-500 text-sm">
                    {errors.about.message}
                  </span>
                )}
              </div>

              {/* 5) Photos (up to 5), plus choose default */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Photos
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className={`w-full h-full object-cover rounded-lg ${
                          index === defaultPhotoIndex
                            ? "ring-4 ring-primary"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <FiX />
                      </button>
                      {index !== defaultPhotoIndex && (
                        <button
                          type="button"
                          className="absolute bottom-2 left-2 px-2 py-1 text-white bg-primary rounded text-sm"
                          onClick={() => setDefaultPhotoIndex(index)}
                        >
                          Make Default
                        </button>
                      )}
                      {index === defaultPhotoIndex && (
                        <span className="absolute bottom-2 left-2 px-2 py-1 text-white bg-green-600 rounded text-sm pointer-events-none">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label
                      className="aspect-square border-2 border-dashed border-primary rounded-lg
                                 flex items-center justify-center cursor-pointer hover:bg-primary/5"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <FiUpload className="text-2xl text-primary" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-1/2 h-12 border-2 border-primary text-primary font-inter font-bold
                             rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-1/2 h-12 bg-primary text-white font-inter font-bold
                             rounded-lg hover:bg-primary-dark transition-all duration-200"
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel: now using the same HONE images slideshow */}
      <div className="hidden md:block md:w-1/2 relative">
        <AnimatePresence>
          <motion.div
            key={honeImages[currentIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <img
              src={honeImages[currentIndex]}
              alt={`HONE ${currentIndex}`}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
