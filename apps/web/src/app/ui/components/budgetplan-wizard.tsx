"use client";

import React, { useMemo, useState } from "react";
import Icon from "@mui/material/Icon";
import { quicksand } from "../fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addBudget } from "@repo/supabase/tools";

interface BudgetPlanWizardProps {
  onClose: () => void;
  onComplete?: (data: BudgetPlanData) => void;
  onBack?: () => void;
}

export interface BudgetPlanData {
  name: string;
  periodType: "weekly" | "biweekly" | "monthly" | "custom";
  periodLengthDays: number | null;
  groups: {
    essentials: {
      limitPercentage: number;
      alertThreshold: number;
    };
    discretionary: {
      limitPercentage: number;
      alertThreshold: number;
    };
    savings: {
      limitPercentage: number;
      alertThreshold: number;
    };
  };
}

const TOTAL_STEPS = 4;

export default function BudgetPlanWizard({
  onClose,
  onComplete,
  onBack,
}: BudgetPlanWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<BudgetPlanData>({
    name: "",
    periodType: "monthly",
    periodLengthDays: null,
    groups: {
      essentials: {
        limitPercentage: 50,
        alertThreshold: 80,
      },
      discretionary: {
        limitPercentage: 30,
        alertThreshold: 90,
      },
      savings: {
        limitPercentage: 20,
        alertThreshold: 85,
      },
    },
  });

  const totalPercentage = useMemo(() => {
    return (
      formData.groups.essentials.limitPercentage +
      formData.groups.discretionary.limitPercentage +
      formData.groups.savings.limitPercentage
    );
  }, [formData]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const updateGroupLimit = (
    group: "essentials" | "discretionary" | "savings",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      groups: {
        ...prev.groups,
        [group]: {
          ...prev.groups[group],
          limitPercentage: value,
        },
      },
    }));
  };

  const updateGroupAlert = (
    group: "essentials" | "discretionary" | "savings",
    value: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      groups: {
        ...prev.groups,
        [group]: {
          ...prev.groups[group],
          alertThreshold: value,
        },
      },
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 2;
      case 2:
        if (formData.periodType === "custom") {
          return Boolean(formData.periodLengthDays && formData.periodLengthDays > 0);
        }
        return true;
      case 3:
        return totalPercentage === 100;
      case 4:
        return (
          formData.groups.essentials.alertThreshold > 0 &&
          formData.groups.discretionary.alertThreshold > 0 &&
          formData.groups.savings.alertThreshold > 0 &&
          formData.groups.essentials.alertThreshold <= 100 &&
          formData.groups.discretionary.alertThreshold <= 100 &&
          formData.groups.savings.alertThreshold <= 100
        );
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    setErrorMessage("");
    setIsSaving(true);

    const response = await addBudget({
      name: formData.name,
      period_type: formData.periodType,
      period_length_days: formData.periodType === "custom" ? formData.periodLengthDays : null,
      plan_groups: {
        essentials: {
          group_name: "essentials",
          limit_percentage: formData.groups.essentials.limitPercentage,
          alert_threshold: formData.groups.essentials.alertThreshold,
        },
        discretionary: {
          group_name: "discretionary",
          limit_percentage: formData.groups.discretionary.limitPercentage,
          alert_threshold: formData.groups.discretionary.alertThreshold,
        },
        savings: {
          group_name: "savings",
          limit_percentage: formData.groups.savings.limitPercentage,
          alert_threshold: formData.groups.savings.alertThreshold,
        },
      },
    });

    if (response instanceof Error) {
      setErrorMessage(response.message || "No se pudo crear el plan de presupuesto.");
      setIsSaving(false);
      return;
    }

    if (onComplete) {
      onComplete(formData);
    }

    setIsSaving(false);
    onClose();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`${quicksand.className} text-3xl font-bold text-neutral-800 dark:text-neutral-200`}
        >
          Plan de Presupuesto
        </h2>
        <button
          onClick={onClose}
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
        >
          <Icon>close</Icon>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === currentStep
                      ? "bg-shamrock-500 text-white"
                      : step < currentStep
                      ? "bg-shamrock-200 dark:bg-shamrock-800 text-shamrock-800 dark:text-shamrock-200"
                      : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {step < currentStep ? <Icon className="text-sm">check</Icon> : step}
                </div>
                <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-400 text-center">
                  {step === 1 && "Nombre"}
                  {step === 2 && "Periodo"}
                  {step === 3 && "Distribución"}
                  {step === 4 && "Alertas"}
                </span>
              </div>
              {step < TOTAL_STEPS && (
                <div
                  className={`h-1 flex-1 mx-2 transition-colors ${
                    step < currentStep
                      ? "bg-shamrock-200 dark:bg-shamrock-800"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mb-8 min-h-[320px]">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Nombra tu presupuesto
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Usa un nombre fácil de reconocer para este plan.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-name">Nombre del plan</Label>
              <Input
                id="budget-name"
                placeholder="Ej: Presupuesto mensual casa"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Define el periodo
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Selecciona cada cuánto se renovará tu presupuesto.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de periodo</Label>
              <Select
                value={formData.periodType}
                onValueChange={(value: "weekly" | "biweekly" | "monthly" | "custom") =>
                  setFormData((prev) => ({
                    ...prev,
                    periodType: value,
                    periodLengthDays: value === "custom" ? 30 : null,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="biweekly">Quincenal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.periodType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="period-days">Duración personalizada (días)</Label>
                <Input
                  id="period-days"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.periodLengthDays || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      periodLengthDays: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Distribuye tu presupuesto
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Ajusta los porcentajes por categoría. Debe sumar 100%.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Gastos esenciales</Label>
                  <span className="text-sm font-semibold text-shamrock-700 dark:text-shamrock-400">
                    {formData.groups.essentials.limitPercentage}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.groups.essentials.limitPercentage]}
                  onValueChange={([value]) => updateGroupLimit("essentials", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Gastos discrecionales</Label>
                  <span className="text-sm font-semibold text-navy-blue-700 dark:text-navy-blue-400">
                    {formData.groups.discretionary.limitPercentage}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.groups.discretionary.limitPercentage]}
                  onValueChange={([value]) => updateGroupLimit("discretionary", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ahorro</Label>
                  <span className="text-sm font-semibold text-punch-700 dark:text-punch-400">
                    {formData.groups.savings.limitPercentage}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[formData.groups.savings.limitPercentage]}
                  onValueChange={([value]) => updateGroupLimit("savings", value)}
                />
              </div>
            </div>

            <div
              className={`rounded-lg p-4 border ${
                totalPercentage === 100
                  ? "bg-shamrock-50 border-shamrock-200 dark:bg-shamrock-900/20 dark:border-shamrock-800"
                  : "bg-punch-50 border-punch-200 dark:bg-punch-900/20 dark:border-punch-800"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  totalPercentage === 100
                    ? "text-shamrock-700 dark:text-shamrock-300"
                    : "text-punch-700 dark:text-punch-300"
                }`}
              >
                Total asignado: {totalPercentage}%
                {totalPercentage === 100 ? " (correcto)" : " (ajusta hasta 100%)"}
              </p>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                Configura alertas
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Define cuándo quieres recibir alertas en cada categoría.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-2">
                <Label htmlFor="alert-essentials">Esenciales (%)</Label>
                <Input
                  id="alert-essentials"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.groups.essentials.alertThreshold}
                  onChange={(e) => updateGroupAlert("essentials", parseInt(e.target.value, 10) || 0)}
                />
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <Label htmlFor="alert-discretionary">Discrecionales (%)</Label>
                <Input
                  id="alert-discretionary"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.groups.discretionary.alertThreshold}
                  onChange={(e) =>
                    updateGroupAlert("discretionary", parseInt(e.target.value, 10) || 0)
                  }
                />
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <Label htmlFor="alert-savings">Ahorro (%)</Label>
                <Input
                  id="alert-savings"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.groups.savings.alertThreshold}
                  onChange={(e) => updateGroupAlert("savings", parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-punch-300 bg-punch-50 p-3 text-sm text-punch-700 dark:border-punch-800 dark:bg-punch-900/20 dark:text-punch-300">
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 && !onBack}
        >
          <Icon className="mr-2">arrow_back</Icon>
          {currentStep === 1 && onBack ? "Volver" : "Anterior"}
        </Button>

        {currentStep < TOTAL_STEPS ? (
          <Button onClick={handleNext} disabled={!isStepValid()}>
            Siguiente
            <Icon className="ml-2">arrow_forward</Icon>
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={!isStepValid() || isSaving}>
            {isSaving ? "Guardando..." : "Finalizar"}
            <Icon className="ml-2">check</Icon>
          </Button>
        )}
      </div>
    </>
  );
}
