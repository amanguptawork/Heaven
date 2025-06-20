import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { GoogleMap, LoadScript, Autocomplete } from "@react-google-maps/api";
import { useRegisterStore } from "../../../store/registerStore";
import { getDenominations } from "../../../api/denominations";
import CreatableSelect from "react-select/creatable";

// Additional imports for fetching and animating
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../../api/axios";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "200px",
  borderRadius: "10px",
};

export const StepThree = ({ onNext, onBack }) => {
  // First, get formData from store
  const formData = useRegisterStore((state) => state.formData);

  // Then use it in state initializations
  const [autocomplete, setAutocomplete] = useState(null);
  // Add this line near your other useState hooks:
  const [churchDenominationValue, setChurchDenominationValue] = useState(
    formData.churchDenomination || null
  );

  const [coordinates, setCoordinates] = useState(
    formData.locationCoordinates?.coordinates
      ? {
          lat: formData.locationCoordinates.coordinates[1],
          lng: formData.locationCoordinates.coordinates[0],
        }
      : null
  );
  const [address, setAddress] = useState(formData.location || "");
  const [denominations, setDenominations] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      location: formData.location || "",
      churchDenomination: formData.churchDenomination || "",
    },
  });

  // Handle Google Maps autocomplete
  const onPlaceSelected = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setCoordinates({ lat, lng });
      const newAddress = place.formatted_address;
      setAddress(newAddress);
      setValue("location", newAddress);
      setValue("locationCoordinates", {
        type: "Point",
        coordinates: [lng, lat],
      });
    }
  };

  // Submit handler
  const onSubmit = (data) => {
    onNext({
      ...data,
      locationCoordinates: coordinates
        ? {
            type: "Point",
            coordinates: [coordinates.lng, coordinates.lat],
          }
        : null,
    });
  };

  // Load denominations for CreatableSelect
  useEffect(() => {
    const fetchDenominations = async () => {
      try {
        const response = await getDenominations();
        const formattedDenominations = response.map((d) => ({
          value: d._id,
          label: d.name,
        }));
        setDenominations(formattedDenominations);
      } catch (error) {
        console.error("Error fetching denominations:", error);
      }
    };
    fetchDenominations();
  }, []);

  // If we have saved coordinates, show the map (cache behavior if user revisits)
  useEffect(() => {
    if (formData.locationCoordinates?.coordinates) {
      setCoordinates({
        lat: formData.locationCoordinates.coordinates[1],
        lng: formData.locationCoordinates.coordinates[0],
      });
    }
  }, [formData]);

  // -----------------------------------------------------------
  // Instead of random user images, use HONE slideshow on the right.
  const honeImages = [
    "/images/HONE 1.jpg",
    "/images/HONE 2.jpg",
    "/images/HONE 3.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate the HONE images every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % honeImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [honeImages]);
  // -----------------------------------------------------------

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden justify-center md:justify-start">
      {/* Left Panel */}
      <div className="w-full md:w-1/2 flex flex-col bg-gradient-to-b from-pink-50/30 to-white">
        <div className="h-16 md:h-20 flex items-center pl-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6"></div>
            <img src="/honelogo.png" alt="HOEC Logo" className="h-[73px]" />
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-[520px] pl-8 pr-8 md:pr-16">
            <h1 className="font-fraunces text-4xl md:text-[46px] font-light text-primary leading-[1.2] mb-4">
              Where are you located?
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Location field + Map */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Your Location
                </label>
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                  libraries={libraries}
                  onLoad={() =>
                    console.log("Google Maps Script loaded successfully")
                  }
                  onError={(error) =>
                    console.error("Google Maps Script loading error:", error)
                  }
                >
                  <Autocomplete
                    onLoad={setAutocomplete}
                    onPlaceChanged={onPlaceSelected}
                  >
                    <input
                      type="text"
                      {...register("location", {
                        required: "Location is required",
                      })}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-12 px-4 border-2 border-primary rounded-lg
                                 font-inter text-base placeholder-gray-500 focus:outline-none focus:ring-2
                                 focus:ring-primary transition-all duration-200"
                      placeholder="Enter your location"
                      onBlur={() => {
                        setTimeout(() => {
                          document
                            .querySelectorAll(".pac-container")
                            .forEach((dropdown) => {
                              dropdown.style.display = "none"; // Ensure it disappears
                            });
                        }, 200); // Delay to allow Google selection event
                      }}
                    />
                  </Autocomplete>

                  {coordinates && (
                    <div
                      className="mt-4"
                      style={{ height: "200px", width: "100%" }}
                    >
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={coordinates}
                        zoom={15}
                        onLoad={() => console.log("Map loaded successfully")}
                      />
                    </div>
                  )}
                </LoadScript>
                {errors.location && (
                  <span className="text-red-500 text-sm">
                    {errors.location.message}
                  </span>
                )}
              </div>

              {/* Church Denomination */}
              <div className="space-y-2">
                <label className="block font-inter text-base text-primary">
                  Church Denomination
                </label>
                <CreatableSelect
                  // keep your existing register call, etc.
                  {...register("churchDenomination", {
                    required: "Church denomination is required",
                  })}
                  menuPlacement="auto"
                  menuPosition="absolute"
                  options={denominations}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Search or type your denomination"
                  isClearable
                  isSearchable
                  // NEW: set the value from state
                  value={churchDenominationValue}
                  onChange={(selected) => {
                    // When user picks an existing denomination, store it in state
                    setChurchDenominationValue(selected);
                    // Also update react-hook-form
                    setValue("churchDenomination", selected);
                    setSuccessMessage("");
                  }}
                  onCreateOption={async (inputValue) => {
                    try {
                      const { data } = await axiosInstance.post(
                        "/denominations",
                        {
                          name: inputValue,
                        }
                      );
                      const newOption = {
                        value: data._id,
                        label: inputValue,
                        isCustom: true,
                      };
                      // Add it to our local denominations list
                      setDenominations((prev) => [...prev, newOption]);
                      // Immediately select it
                      setChurchDenominationValue(newOption);
                      // Update react-hook-form
                      setValue("churchDenomination", newOption);
                      // Success message
                      setSuccessMessage(
                        `"${inputValue}" has been created and selected automatically.`
                      );
                      return newOption;
                    } catch (error) {
                      console.error("Error saving denomination:", error);
                      setSuccessMessage(
                        "Failed to add denomination. Please try again."
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
                {errors.churchDenomination && (
                  <span className="text-red-500 text-sm">
                    {errors.churchDenomination.message}
                  </span>
                )}
                {/* Tiny label at the bottom */}
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
                  className="w-1/2 h-12 bg-primary text-white font-inter font-bold
                             rounded-lg hover:bg-primary-dark transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel: now using the same HONE images slideshow */}
      <div className="relative hidden md:block md:w-1/2 h-screen p-0 m-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {honeImages.map((img, index) =>
            index === currentIndex ? (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8 }}
                className="absolute top-0 left-0 w-full h-full"
              >
                <img
                  src={img}
                  alt={`HONE Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
