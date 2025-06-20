import { useState, useEffect } from "react";
import MainContent from "../../components/Dashboard/MainContent";
import PreferenceModal from "../../components/Dashboard/PreferenceModal";
import { useNavigate } from "react-router-dom";
import useUserProfileStore from "../../store/user";

const Dashboard = () => {
  const { userProfile, hasTakenTest } = useUserProfileStore();
  const navigate = useNavigate();
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const hasPreferences = localStorage.getItem("matchPreferences");
    if (!hasPreferences) {
      setShowPreferences(true);
    }
  }, []);

  useEffect(() => {
    if (!showPreferences && userProfile && !hasTakenTest) {
      navigate("/personality-test");
    }
  }, [showPreferences, userProfile, hasTakenTest, navigate]);

  const handlePreferenceSelect = (preference) => {
    localStorage.setItem("matchPreferences", preference);
    setShowPreferences(false);
  };

  return (
    <div className="flex md:h-screen h-auto w-full bg-[#F3EAFF] overflow-hidden pb-[90px] md:pb-0">
      <MainContent />

      {showPreferences && <PreferenceModal onSelect={handlePreferenceSelect} />}
    </div>
  );
};

export default Dashboard;
