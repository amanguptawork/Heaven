import { useState } from 'react';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';
import { StepFour } from './StepFour';
import { useRegisterStore } from '../../../store/registerStore';

const RegisterForm = () => {
  const formData = useRegisterStore(state => state.formData);
  const setFormData = useRegisterStore(state => state.setFormData);
  const [step, setStep] = useState(
    // if we came via Google, skip straight to step 2
    formData.isGoogleLogin ? 2 : 1
  );

  const handleNext = (data) => {
    setFormData({ ...formData, ...data });
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepOne onNext={handleNext} />;
      case 2:
        return <StepTwo onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <StepThree onNext={handleNext} onBack={handleBack} />;
      case 4:
        return <StepFour onNext={handleNext} onBack={handleBack} />;
      default:
        return <StepOne onNext={handleNext} />;
    }
  };

  return (
    <div className="w-full h-full">
      {renderStep()}
    </div>
  );
};

export default RegisterForm;
