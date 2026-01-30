"use client";

import React, { useState } from "react";
import Icon from "@mui/material/Icon";
import { quicksand } from "../fonts";
import RetirementWizard from "./retirement-wizard";

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RetirementPlanData {
  name: string;
  accountId: string;
  currentAge: number;
  retirementAge: number;
  retirementDuration: number;
  monthlyContribution: number;
  monthlyRetirementIncome: number;
  estimatedInterestRate: number;
  interestRateVarianceMin: number;
  interestRateVarianceMax: number;
  inflationRate: number;
  initialAmount: number;
}

interface ToolOption {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const toolOptions: ToolOption[] = [
  {
    id: "budget",
    name: "Presupuesto",
    icon: "account_balance_wallet",
    description: "Planifica tus gastos mensuales",
  },
  {
    id: "savings",
    name: "Meta de Ahorro",
    icon: "savings",
    description: "Establece objetivos de ahorro",
  },
  {
    id: "retirement",
    name: "Plan de Retiro",
    icon: "elderly",
    description: "Planifica tu jubilación",
  },
  {
    id: "investment",
    name: "Inversiones",
    icon: "trending_up",
    description: "Gestiona tus inversiones",
  },
  {
    id: "debt",
    name: "Control de Deudas",
    icon: "credit_card",
    description: "Administra tus deudas",
  },
  {
    id: "emergency",
    name: "Fondo de Emergencia",
    icon: "health_and_safety",
    description: "Crea tu fondo de emergencia",
  },
];

export default function AddToolModal({ isOpen, onClose }: AddToolModalProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handleToolSelect = (toolId: string) => {
    console.log("Selected tool:", toolId);
    
    if (toolId === "retirement") {
      setSelectedTool("retirement");
      return;
    }
    
    // TODO: Navigate to tool configuration page or open configuration modal for other tools
    onClose();
  };

  const handleRetirementComplete = (data: RetirementPlanData) => {
    console.log("Retirement plan created:", data);
    // TODO: Save the retirement plan data
    setSelectedTool(null);
    onClose();
  };

  const handleBackToTools = () => {
    setSelectedTool(null);
  };

  const handleClose = () => {
    setSelectedTool(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-8  w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {selectedTool === "retirement" ? (
          <RetirementWizard
            onClose={handleClose}
            onComplete={handleRetirementComplete}
            onBack={handleBackToTools}
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`${quicksand.className} text-3xl font-bold text-neutral-800 dark:text-neutral-200`}
              >
                Agregar Herramienta
              </h2>
              <button
                onClick={handleClose}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                <Icon>close</Icon>
              </button>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              Selecciona la herramienta que deseas configurar
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {toolOptions.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-400 border-2 border-transparent transition-all group aspect-square cursor-pointer"
                >
                  <Icon className="text-5xl text-neutral-600 dark:text-neutral-300 group-hover:text-orange-500 mb-3">
                    {tool.icon}
                  </Icon>
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 text-center mb-1">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                    {tool.description}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
