import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Tour Store — manages the onboarding product tour state.
 *
 * Persisted:
 *   tourCompleted — true once the user finishes or skips. Never re-shows.
 *
 * Runtime only (not persisted):
 *   tourActive    — whether the overlay is currently visible
 *   currentStep   — which step index is showing (0-based)
 */

type TourState = {
    // Persisted
    tourCompleted: boolean;

    // Runtime
    tourActive: boolean;
    currentStep: number;

    // Actions
    startTour: () => void;
    nextStep: (totalSteps: number) => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    skipTour: () => void;
    completeTour: () => void;
    resetTour: () => void; // for replay from Settings
};

export const useTourStore = create<TourState>()(
    persist(
        (set) => ({
            tourCompleted: false,
            tourActive: false,
            currentStep: 0,

            startTour: () =>
                set({ tourActive: true, currentStep: 0 }),

            nextStep: (totalSteps) =>
                set((state) => {
                    const next = state.currentStep + 1;
                    if (next >= totalSteps) {
                        return { tourActive: false, tourCompleted: true, currentStep: 0 };
                    }
                    return { currentStep: next };
                }),

            prevStep: () =>
                set((state) => ({
                    currentStep: Math.max(0, state.currentStep - 1),
                })),

            goToStep: (step) =>
                set({ currentStep: step }),

            skipTour: () =>
                set({ tourActive: false, tourCompleted: true, currentStep: 0 }),

            completeTour: () =>
                set({ tourActive: false, tourCompleted: true, currentStep: 0 }),

            resetTour: () =>
                set({ tourActive: true, currentStep: 0, tourCompleted: false }),
        }),
        {
            name: "briefly-tour",
            storage: createJSONStorage(() => localStorage),
            // Only persist tourCompleted — runtime state should reset on page load
            partialize: (state) => ({ tourCompleted: state.tourCompleted }),
        }
    )
);
