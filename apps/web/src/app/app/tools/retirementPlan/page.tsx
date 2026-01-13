"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Force dynamic rendering - prevents static generation at build time
export const dynamic = 'force-dynamic';

export default function RetirementPlanPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Plan de Jubilación</h1>
          <Button>Nuevo Plan</Button>
        </div>

        {/* Main Content */}
        <Card className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Comienza a planificar tu jubilación</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
