import { create } from 'zustand';

export const useRegisterStore = create((set) => ({
  formData: {
    email: '',
    fullName: '',
    dateOfBirth: null,
    gender: '',
    password: '',
    location: '',
    locationCoordinates: null,
    churchDenomination: '',
    maritalStatus: '',
    occupation: '',
    interests: [],
    about: '',
    photos: []
  },
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data }
    })),
  resetForm: () => set({ formData: {} })
}));
