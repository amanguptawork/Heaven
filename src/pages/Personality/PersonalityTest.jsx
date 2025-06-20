import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import PersonalityQuestionnaire from "../../components/Dashboard/PersonalityQuestionnaire";
import { checkAuthStatus } from "../../api/auth";

const PersonalityTest = () => {
  const navigate = useNavigate();

  // Keep your existing state
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);

  // Track user state
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log("PersonalityTest page mounted");
    (async () => {
      try {
        const loggedInUser = await checkAuthStatus();
        if (!loggedInUser) {
          window.location.reload();
        } else {
          setUser(loggedInUser);
          console.log("Current user on PersonalityTest page:", loggedInUser);
        }
      } catch (error) {
        console.error("Error fetching user in PersonalityTest page:", error);
        window.location.reload();
      }
    })();
  }, []);

  const handleTestComplete = async (formattedData) => {
    try {
      localStorage.setItem("personalityResults", JSON.stringify(formattedData));
      toast.success("Personality test completed successfully!");
      navigate("/personality-matches");
    } catch (error) {
      console.error("Error saving personality results:", error);
      toast.error("Failed to save personality test results. Please try again.");
    }
  };

  const handleClose = () => {
    if (
      window.confirm(
        "Are you sure you want to exit? Your progress will be lost."
      )
    ) {
      setShowQuestionnaire(false);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showQuestionnaire && (
        <PersonalityQuestionnaire
          onComplete={handleTestComplete}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default PersonalityTest;
