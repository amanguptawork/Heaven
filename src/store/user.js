import { create } from "zustand";

const useUserProfileStore = create((set) => ({
  userProfile: null,
  hasTakenTest: false,
  setUserProfile: (userProfile) => {
    const hasTakenTest =
      userProfile?.personalityScores &&
      Object.keys(userProfile.personalityScores).length > 0;

    set({ userProfile, hasTakenTest });
  },
  resetUserProfile: () => set({ userProfile: null, hasTakenTest: false }),
}));

export default useUserProfileStore;
