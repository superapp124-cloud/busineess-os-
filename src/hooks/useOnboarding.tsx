import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useOnboarding = (userId: string | undefined) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) {
      setIsOpen(false);
      return;
    }

    // Only query `profiles` — the `users` table does not exist on this Supabase project
    const checkOnboardingStatus = async () => {
      const { data: profileRecord } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .maybeSingle();

      const onboardingCompleted = profileRecord?.onboarding_completed;
      if (!onboardingCompleted) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkOnboardingStatus();
  }, [userId]);

  const completeStep = async (stepName: string) => {
    if (!userId) return;

    await supabase.from('onboarding_progress').upsert({
      user_id: userId,
      step_name: stepName,
      completed: true,
      completed_at: new Date().toISOString(),
    });
  };

  const completeOnboarding = async () => {
    if (!userId) return;

    const completedAt = new Date().toISOString();
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        profile_completed_at: completedAt,
      } as any)
      .eq('id', userId);

    if (profileError) {
      toast({
        title: "Error",
        description: profileError.message || "Failed to complete onboarding",
        variant: "destructive",
      });
      return false;
    }

    setIsOpen(false);
    return true;
  };

  const skipOnboarding = async () => {
    if (!userId) return;

    await completeOnboarding();
    toast({
      title: "Skipped onboarding",
      description: "You can complete your profile anytime from settings",
    });
  };

  return {
    isOpen,
    currentStep,
    setCurrentStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
    setIsOpen,
  };
};
