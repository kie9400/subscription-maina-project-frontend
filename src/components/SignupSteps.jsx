import React from 'react';
import styles from '../styles/SignupSteps.module.css';

const SignupSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, title: '약관동의' },
    { number: 2, title: '본인인증' },
    { number: 3, title: '정보입력' }
  ];

  return (
    <div className={styles.stepsContainer}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={styles.step}>
            <div className={`${styles.stepNumber} ${currentStep >= step.number ? styles.active : ''}`}>
              {step.number}
            </div>
            <div className={`${styles.stepTitle} ${currentStep >= step.number ? styles.active : ''}`}>
              {step.title}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`${styles.connector} ${currentStep > step.number ? styles.active : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SignupSteps; 