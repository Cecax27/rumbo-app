"use client";

import React, { useRef } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportStep1FileSelectionProps {
  onFileSelect: (file: File) => void;
  bank: string;
  onBankChange: (bank: string) => void;
  isLoading: boolean;
}

export function ImportStep1FileSelection({
  onFileSelect,
  bank,
  onBankChange,
  isLoading,
}: ImportStep1FileSelectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.type.includes("spreadsheetml")) {
        alert("Por favor selecciona un archivo Excel (.xlsx)");
        return;
      }
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Selecciona tu banco</label>
        <Select value={bank} onValueChange={onBankChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BBVA">BBVA</SelectItem>
            {/* Add more banks here in the future */}
          </SelectContent>
        </Select>
        <p className="text-xs text-neutral-500 mt-1">
          Por ahora solo soportamos BBVA. Próximamente agregaremos más bancos.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Descarga tu reporte</label>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>¿Cómo descargar tu reporte?</AlertTitle>
          <AlertDescription className="mt-2 text-xs">
            <ol className="list-decimal list-inside space-y-1">
              <li>Inicia sesión en {bank}</li>
              <li>Ve a tu cuenta corriente</li>
              <li>Selecciona el rango de fechas deseado</li>
              <li>Descarga el archivo en formato Excel (.xlsx)</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Selecciona el archivo</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {selectedFileName ? `Archivo: ${selectedFileName}` : "Seleccionar archivo"}
        </Button>
      </div>

      {selectedFileName && (
        <p className="text-sm text-green-600 dark:text-green-400">
          ✓ Archivo seleccionado: {selectedFileName}
        </p>
      )}
    </div>
  );
}
