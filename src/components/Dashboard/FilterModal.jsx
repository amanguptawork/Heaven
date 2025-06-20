import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// API fetch functions defined at module level
const fetchDenominations = async () => {
  try {
    const response = await axiosInstance.get("/denominations");
    return response.data;
  } catch (error) {
    console.error("Denominations fetch error:", error);
    throw error;
  }
};

const fetchMaritalStatuses = async () => {
  try {
    const response = await axiosInstance.get("/marital-statuses");

    return response.data;
  } catch (error) {
    console.error("Marital statuses fetch error:", error);
    throw error;
  }
};

const fetchOccupations = async () => {
  try {
    const response = await axiosInstance.get("/occupations");

    return response.data;
  } catch (error) {
    console.error("Occupations fetch error:", error);
    throw error;
  }
};

const fetchInterests = async () => {
  try {
    const response = await axiosInstance.get("/interests");

    return response.data;
  } catch (error) {
    console.error("Interests fetch error:", error);
    throw error;
  }
};

// Main FilterModal component
const FilterModal = ({ currentFilters, onClose, onApply }) => {
  const defaultFilters = {
    ageRange: { min: 18, max: 65 },
    distance: 100,
    denomination: "",
    maritalStatus: "",
    occupation: "",
    interests: [],
  };

  const [filters, setFilters] = useState(currentFilters || defaultFilters);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Query hooks
  const { data: denominations = [], isLoading: loadingDenominations } =
    useQuery({
      queryKey: ["denominations"],
      queryFn: fetchDenominations,
      initialData: [],
      retry: 3,
      retryDelay: 1000,
      refetchOnMount: "always",
      refetchOnReconnect: true,
      refetchInterval: false,
      onError: (error) => {
        console.error("Denominations query error:", error);
      },
      select: (data) => {
        return Array.isArray(data) ? data : [];
      },
    });

  const { data: maritalStatuses = [], isLoading: loadingMaritalStatuses } =
    useQuery({
      queryKey: ["maritalStatuses"],
      queryFn: fetchMaritalStatuses,
      initialData: [],
      retry: 3,
      retryDelay: 1000,
      refetchOnMount: "always",
      refetchOnReconnect: true,
      refetchInterval: false,
      onError: (error) => {
        console.error("Marital statuses query error:", error);
      },
      select: (data) => {
        return Array.isArray(data) ? data : [];
      },
    });

  const { data: occupations = [], isLoading: loadingOccupations } = useQuery({
    queryKey: ["occupations"],
    queryFn: fetchOccupations,
    initialData: [],
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchInterval: false,
    onError: (error) => {
      console.error("Occupations query error:", error);
    },
    select: (data) => {
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: interests = [], isLoading: loadingInterests } = useQuery({
    queryKey: ["interests"],
    queryFn: fetchInterests,
    initialData: [],
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchInterval: false,
    onError: (error) => {
      console.error("Interests query error:", error);
    },
    select: (data) => {
      return Array.isArray(data) ? data : [];
    },
  });

  // Flatten the interests into options for multi-select
  const interestOptions = interests.reduce((acc, category) => {
    if (Array.isArray(category.interests)) {
      const subInterests = category.interests.map((intr) => ({
        value: intr.name,
        label: intr.name,
      }));
      return [...acc, ...subInterests];
    }
    return acc;
  }, []);

  // Event handlers
  const handleSubmit = (e) => {
    e.preventDefault();

    // Create clean filters object
    const cleanFilters = {};

    if (filters.denomination) {
      cleanFilters.denomination = filters.denomination;
    }
    // Only add filters that have actual values
    if (filters.denomination && filters.denomination !== "") {
      cleanFilters.denomination = filters.denomination;
    }

    if (filters.distance && filters.distance !== 100) {
      cleanFilters.distance = filters.distance;
    }

    if (filters.maritalStatus && filters.maritalStatus !== "") {
      cleanFilters.maritalStatus = filters.maritalStatus;
    }

    if (filters.occupation && filters.occupation !== "") {
      cleanFilters.occupation = filters.occupation;
    }

    if (filters.interests && filters.interests.length > 0) {
      cleanFilters.interests = filters.interests;
    }

    if (
      filters.ageRange &&
      (filters.ageRange.min !== 18 || filters.ageRange.max !== 65)
    ) {
      cleanFilters.ageRange = filters.ageRange;
    }

    onApply(cleanFilters);
  };

  // Loading state check
  if (
    loadingDenominations ||
    loadingMaritalStatuses ||
    loadingOccupations ||
    loadingInterests
  ) {
    return (
      <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div className="bg-white rounded-2xl p-6">
          <p className="text-lg font-medium text-purple-600">
            Loading filters...
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h2 className="text-2xl font-bold text-purple-600">Filter Matches</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-50 rounded-full text-purple-600"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setFilters(defaultFilters)}
          className="mb-4 ml-auto flex-1 px-2 py-2 border text-sm border-gray-300 text-gray-700 rounded-sm hover:bg-gray-100 font-normal transition-colors"
        >
          Reset Filters
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Distance Slider */}
          <div className="bg-purple-50 p-4 rounded-xl">
            <label className="block text-sm font-medium mb-2 text-purple-700">
              Maximum Distance
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="500"
                value={filters.distance || 100}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFilters((prev) => ({
                    ...prev,
                    distance: value,
                  }));
                }}
                className="flex-1 accent-purple-600"
              />
              <span className="text-purple-700 font-medium w-20 text-center">
                {filters.distance || 100} km
              </span>
            </div>
          </div>

          {/* Age Range */}
          <div className="bg-purple-50 p-4 rounded-xl">
            <label className="block text-sm font-medium mb-2 text-purple-700">
              Age Range
            </label>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-purple-600 w-16">Minimum</span>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={filters.ageRange?.min || 18}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: {
                        ...prev.ageRange,
                        min: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="flex-1 accent-purple-600"
                />
                <span className="text-purple-700 font-medium w-12 text-center">
                  {filters.ageRange?.min || 18}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-purple-600 w-16">Maximum</span>
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={filters.ageRange?.max || 65}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageRange: {
                        ...prev.ageRange,
                        max: parseInt(e.target.value),
                      },
                    }))
                  }
                  className="flex-1 accent-purple-600"
                />
                <span className="text-purple-700 font-medium w-12 text-center">
                  {filters.ageRange?.max || 65}
                </span>
              </div>
            </div>
          </div>

          {/* Denomination Select */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Church Denomination
            </label>
            <select
              value={filters.denomination || ""}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  denomination: e.target.value || undefined,
                }));
              }}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Any Denomination</option>
              {Array.isArray(denominations) &&
                denominations.map((denom) => (
                  <option key={denom._id} value={denom._id}>
                    {denom.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Marital Status
            </label>
            <select
              value={filters.maritalStatus || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maritalStatus: e.target.value,
                }))
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Any Status</option>
              {Array.isArray(maritalStatuses) &&
                maritalStatuses.map((status) => (
                  <option key={status._id} value={status._id}>
                    {status.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Occupation
            </label>
            <select
              value={filters.occupation || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  occupation: e.target.value,
                }))
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Any Occupation</option>
              {Array.isArray(occupations) &&
                occupations.map((occ) => (
                  <option key={occ._id} value={occ._id}>
                    {occ.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Interests => Now a multi-select dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Interests
            </label>
            <Select
              isMulti
              placeholder="Select interests"
              value={
                (filters.interests || []).map((intr) => ({
                  value: intr,
                  label: intr,
                })) || []
              }
              onChange={(selected) => {
                const newValues = selected
                  ? selected.map((item) => item.value)
                  : [];
                setFilters((prev) => ({ ...prev, interests: newValues }));
              }}
              options={interestOptions}
              classNamePrefix="react-select"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-white pt-4 border-t items-center">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FilterModal;
