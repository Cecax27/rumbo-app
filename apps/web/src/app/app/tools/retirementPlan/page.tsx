"use client";

import React, { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTools } from "@/contexts/ToolsContext";
import { useSearchParams } from "next/navigation";
import { ChartLineDots } from "./chart";

export const dynamic = 'force-dynamic';

function RetirementPlanContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { retirementPlans } = useTools();
    const retirementPlan = retirementPlans.find(plan => plan.id === id);

  return (
    <div className="w-full mx-auto p-6 overflow-y-scroll">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{retirementPlan ? retirementPlan.name : "Plan de Jubilación"}</h1>
          <Button disabled={true}></Button>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            <ChartLineDots planId={id || ""} />
            
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RetirementPlanPage() {
  return (
    <Suspense fallback={null}>
      <RetirementPlanContent />
    </Suspense>
  );
}
