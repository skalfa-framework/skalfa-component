import { ReactNode } from "react";
import { cn } from "@utils";



export interface WizardProps {
  items   :  {label: string, circle_content: ReactNode}[];
  active  :  number;
};



export function WizardComponent({ 
  items, 
  active 
}: WizardProps) {
  return (
    <div>
      <div className="w-full py-4">
        <div className="flex">
          {items.map((item, key) => {
            const isStepActive = key <= active;
            const isLineActive = key <= active + 1;
            const isLineGradient = key == active + 1;

            return (
              <div
                key={key}
                style={{ width: `calc(100% * 1 / ${items.length})` }}
              >
                <div className="wizard-step-header">
                  {key > 0 && (
                    <div
                      className="wizard-progress-bar-wrapper"
                      style={{
                        width: "calc(100% - 2.5rem - 1rem)",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="wizard-progress-bar-bg">
                        <div
                          className={cn(
                            "wizard-progress-bar-fill",
                            isLineGradient
                              ? "wizard-progress-bar-fill-gradient"
                              : isLineActive
                                ? "wizard-progress-bar-fill-active"
                                : ""
                          )}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      "wizard-circle",
                      isStepActive
                        ? "wizard-circle-active"
                        : "wizard-circle-inactive"
                    )}
                  >
                    <span className="text-center w-full">
                      {item.circle_content}
                    </span>
                  </div>
                </div>

                <div className="wizard-label">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
