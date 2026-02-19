import React from 'react';
import { Order } from '../types';
import { Check } from 'lucide-react';

interface OrderStatusTrackerProps {
  status: Order['status'];
}

const steps: Order['status'][] = ['Processing', 'Shipped', 'Delivered', 'Completed'];

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ status }) => {
  const currentStepIndex = steps.indexOf(status);

  return (
    <div className="w-full px-2">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isActive ? 'bg-white border-green-500' : ''}
                    ${!isCompleted && !isActive ? 'bg-gray-200 border-gray-300' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check size={16} />
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                    ></div>
                  )}
                </div>
                <p
                  className={`text-xs mt-2 text-center ${isActive || isCompleted ? 'font-bold text-gray-800' : 'text-gray-500'}`}
                >
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
