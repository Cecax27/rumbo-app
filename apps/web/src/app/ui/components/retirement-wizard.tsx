"use client";

import React, { useState, useContext } from "react";
import { quicksand } from "../fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@mui/material/Icon";
import { AccountsContext } from "@/contexts/AccountsContext";
import { formatMoney } from "@repo/formatters";

interface RetirementWizardProps {
  onClose: () => void;
  onComplete?: (data: RetirementPlanData) => void;
  onBack?: () => void;
}

interface RetirementPlanData {
  name: string;
  accountId: string;
  currentAge: number;
  retirementAge: number;
  retirementDuration: number; // years to use retirement money
  monthlyContribution: number;
  monthlyRetirementIncome: number; // how much money user can use per month in retirement
  estimatedInterestRate: number;
  interestRateVarianceMin: number;
  interestRateVarianceMax: number;
  inflationRate: number;
  initialAmount: number; // total sum already saved
}

const TOTAL_STEPS = 4;

export default function RetirementWizard({
  onClose,
  onComplete,
  onBack,
}: RetirementWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { accounts } = useContext(AccountsContext);
  
  const [formData, setFormData] = useState<RetirementPlanData>({
    name: "",
    accountId: "",
    currentAge: 0,
    retirementAge: 65,
    retirementDuration: 20,
    monthlyContribution: 500,
    monthlyRetirementIncome: 2000,
    estimatedInterestRate: 7,
    interestRateVarianceMin: 5,
    interestRateVarianceMax: 9,
    inflationRate: 3,
    initialAmount: 0,
  });

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      // If we're on step 1 and onBack is provided, go back to tool selection
      onBack();
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(formData);
    }
    onClose();
  };

  const updateFormData = <K extends keyof RetirementPlanData>(
    field: K,
    value: RetirementPlanData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.accountId !== "";
      case 3:
        return (
          formData.currentAge > 0 && 
          formData.retirementAge > formData.currentAge &&
          formData.retirementDuration > 0
        );
      case 4:
        return (
          formData.monthlyContribution > 0 &&
          formData.monthlyRetirementIncome > 0 &&
          formData.estimatedInterestRate > 0 &&
          formData.interestRateVarianceMin < formData.estimatedInterestRate &&
          formData.interestRateVarianceMax > formData.estimatedInterestRate &&
          formData.inflationRate >= 0
        );
      default:
        return false;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
          <h2
            className={`${quicksand.className} text-3xl font-bold text-neutral-800 dark:text-neutral-200`}
          >
            Plan de Retiro
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            <Icon>close</Icon>
          </button>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step === currentStep
                        ? "bg-orange-500 text-white"
                        : step < currentStep
                        ? "bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
                    }`}
                  >
                    {step < currentStep ? (
                      <Icon className="text-sm">check</Icon>
                    ) : (
                      step
                    )}
                  </div>
                  <span className="text-xs mt-2 text-neutral-600 dark:text-neutral-400 text-center">
                    {step === 1 && "Nombre"}
                    {step === 2 && "Cuenta"}
                    {step === 3 && "Edad"}
                    {step === 4 && "Contribución"}
                  </span>
                </div>
                {step < TOTAL_STEPS && (
                  <div
                    className={`h-1 flex-1 mx-2 transition-colors ${
                      step < currentStep
                        ? "bg-orange-200 dark:bg-orange-800"
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 min-h-[300px]">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Nombra tu plan de retiro
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Elige un nombre descriptivo para identificar tu plan
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planName">Nombre del plan</Label>
                <Input
                  id="planName"
                  placeholder="Ej: Retiro a los 65"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="text-base"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Vincula una cuenta
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Selecciona la cuenta donde guardarás tu fondo de retiro
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account">Cuenta</Label>
                <Select
                  value={formData.accountId}
                  onValueChange={(value) => {
                    updateFormData("accountId", value);
                    // Update initial amount with the selected account's balance
                    const selectedAccount = accounts.find(acc => acc.id.toString() === value);
                    if (selectedAccount && selectedAccount.balance !== undefined) {
                      updateFormData("initialAmount", selectedAccount.balance);
                    }
                  }}
                >
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                          {account.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.accountId && (() => {
                const selectedAccount = accounts.find(acc => acc.id.toString() === formData.accountId);
                return selectedAccount ? (
                  <div className="bg-navy-blue-50 dark:bg-navy-blue-900/20 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        Saldo actual de la cuenta:
                      </span>
                      <span className="text-2xl font-bold text-navy-blue-700 dark:text-navy-blue-300">
                        {selectedAccount.balance !== undefined 
                          ? formatMoney(selectedAccount.balance)
                          : "Cargando..."}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      💡 Este monto será considerado como el monto inicial en tu meta de retiro
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Información de edad
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Establece tu edad actual, edad de retiro y cuántos años durará tu retiro
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentAge">Edad actual</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.currentAge || ""}
                    onChange={(e) =>
                      updateFormData("currentAge", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Edad de retiro</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.retirementAge || ""}
                    onChange={(e) =>
                      updateFormData("retirementAge", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementDuration">Años de retiro</Label>
                  <Input
                    id="retirementDuration"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.retirementDuration || ""}
                    onChange={(e) =>
                      updateFormData("retirementDuration", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              {formData.currentAge > 0 && formData.retirementAge > formData.currentAge && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg space-y-1">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong>{formData.retirementAge - formData.currentAge} años</strong> para alcanzar tu meta de retiro
                  </p>
                  {formData.retirementDuration > 0 && (
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Tu retiro durará hasta los <strong>{formData.retirementAge + formData.retirementDuration} años</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Parámetros financieros
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Ajusta los parámetros y ve cómo crecerán tus ahorros
                </p>
              </div>
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Inputs */}
                <div className="space-y-4">
                  <TooltipProvider>
                    <Accordion type="multiple" defaultValue={["main", "parameters"]} className="space-y-2">
                      {/* Main Inputs */}
                      <AccordionItem value="main" className="border rounded-lg px-4">
                        <AccordionTrigger className="text-base font-semibold">
                          Parámetros principales
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          {/* Initial Amount - Text Display */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Monto inicial</Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Icon className="text-neutral-400 text-base cursor-help">info</Icon>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">El saldo actual de la cuenta vinculada que se usará como punto de partida para tu plan de retiro.</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="bg-neutral-100 dark:bg-neutral-700 rounded-md p-3 border border-neutral-200 dark:border-neutral-600">
                              <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                                {formatMoney(formData.initialAmount)}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                De la cuenta vinculada
                              </p>
                            </div>
                          </div>

                          {/* Monthly Contribution Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="monthlyContribution" className="text-sm">Contribución mensual</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Icon className="text-neutral-400 text-base cursor-help">info</Icon>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Cantidad que planeas aportar cada mes a tu fondo de retiro. Este monto se acumulará y generará intereses.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                {formatMoney(formData.monthlyContribution)}
                              </span>
                            </div>
                            <Slider
                              id="monthlyContribution"
                              min={0}
                              max={10000}
                              step={50}
                              value={[formData.monthlyContribution]}
                              onValueChange={([value]) => updateFormData("monthlyContribution", value)}
                              className="py-2"
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>$0</span>
                              <span>$10,000</span>
                            </div>
                          </div>

                          {/* Monthly Retirement Income Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="monthlyRetirementIncome" className="text-sm">Ingreso mensual en retiro</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Icon className="text-neutral-400 text-base cursor-help">info</Icon>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Cantidad que deseas retirar mensualmente cuando te jubiles. Esto determinará cuánto tiempo durarán tus fondos.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <span className="text-sm font-semibold text-shamrock-600 dark:text-shamrock-400">
                                {formatMoney(formData.monthlyRetirementIncome)}
                              </span>
                            </div>
                            <Slider
                              id="monthlyRetirementIncome"
                              min={0}
                              max={15000}
                              step={100}
                              value={[formData.monthlyRetirementIncome]}
                              onValueChange={([value]) => updateFormData("monthlyRetirementIncome", value)}
                              className="py-2"
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>$0</span>
                              <span>$15,000</span>
                            </div>
                          </div>

                          {/* Interest Rate Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="estimatedRate" className="text-sm">Tasa de interés anual</Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Icon className="text-neutral-400 text-base cursor-help">info</Icon>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-xs">Rendimiento anual estimado de tus inversiones. Un valor típico está entre 5% y 10% dependiendo del tipo de inversión.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <span className="text-sm font-semibold text-navy-blue-600 dark:text-navy-blue-400">
                                {formData.estimatedInterestRate.toFixed(1)}%
                              </span>
                            </div>
                            <Slider
                              id="estimatedRate"
                              min={0}
                              max={20}
                              step={0.1}
                              value={[formData.estimatedInterestRate]}
                              onValueChange={([value]) => updateFormData("estimatedInterestRate", value)}
                              className="py-2"
                            />
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>0%</span>
                              <span>20%</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                    {/* Parameters */}
                    <AccordionItem value="parameters" className="border rounded-lg px-4">
                      <AccordionTrigger className="text-base font-semibold">
                        Parámetros avanzados
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {/* Inflation Rate */}
                        <div className="space-y-2">
                          <Label htmlFor="inflationRate" className="text-sm">Tasa de inflación anual (%)</Label>
                          <Input
                            id="inflationRate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="text-sm h-9"
                            value={formData.inflationRate || ""}
                            onChange={(e) =>
                              updateFormData(
                                "inflationRate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        {/* Interest Rate Variance */}
                        <div>
                          <Label className="mb-2 block text-sm">Rango de varianza de interés (%)</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="minRate" className="text-xs text-neutral-600 dark:text-neutral-400">
                                Mínimo
                              </Label>
                              <Input
                                id="minRate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="text-sm h-9"
                                value={formData.interestRateVarianceMin || ""}
                                onChange={(e) =>
                                  updateFormData(
                                    "interestRateVarianceMin",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxRate" className="text-xs text-neutral-600 dark:text-neutral-400">
                                Máximo
                              </Label>
                              <Input
                                id="maxRate"
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="text-sm h-9"
                                value={formData.interestRateVarianceMax || ""}
                                onChange={(e) =>
                                  updateFormData(
                                    "interestRateVarianceMax",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  </TooltipProvider>
                </div>

                {/* Right Column - Results */}
                <div className="bg-linear-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                  <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
                    <Icon className="text-orange-500">insights</Icon>
                    Proyección de retiro
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Placeholder for calculations - will be implemented */}
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Total acumulado al retiro
                      </p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {formatMoney(0)}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Total contribuido
                      </p>
                      <p className="text-xl font-semibold text-navy-blue-600 dark:text-navy-blue-400">
                        {formatMoney(0)}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Intereses generados
                      </p>
                      <p className="text-xl font-semibold text-shamrock-600 dark:text-shamrock-400">
                        {formatMoney(0)}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                        Duración de fondos en retiro
                      </p>
                      <p className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                        {formData.retirementDuration} años
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <p className="text-xs text-orange-800 dark:text-orange-200">
                        💡 Los cálculos se actualizarán en tiempo real conforme ajustes los parámetros
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
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
            <Button onClick={handleComplete} disabled={!isStepValid()}>
              Finalizar
              <Icon className="ml-2">check</Icon>
            </Button>
          )}
        </div>
    </>
  );
}
