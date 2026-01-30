import React from "react";
import { useState } from "react";
import { Control, FieldValues } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRANSACTION_CATEGORIES } from "@repo/app-constants";
import Icon from "@mui/material/Icon";
import { formatIcon } from "@repo/formatters";
interface CategoryPopOverProps<T extends FieldValues> {
  control: Control<T>;
}

// Prepare categories for display

const categories = TRANSACTION_CATEGORIES.flatMap((group) =>
  group.categories.map((category) => ({
    id: category.id.toString(),
    name: category.name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    icon: category.icon,
    budget_group: group.budget_group,
  })),
);

export default function CategoryPopOver<T extends FieldValues>({
  control,
}: CategoryPopOverProps<T>) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name="category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoría</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <FormControl>
              <PopoverTrigger asChild>
                <div className="relative w-full">
                  <Input
                    readOnly
                    value={(() => {
                      const selected = categories.find(cat => cat.id === field.value);
                      return selected ? selected.name : '';
                    })()}
                    placeholder="Selecciona una categoría"
                    className="cursor-pointer pl-10"
                  />
                  {(() => {
                    const selected = categories.find(cat => cat.id === field.value);
                    if (selected) {
                      return (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                          <Icon color="primary" fontSize="small">{formatIcon(selected.icon)}</Icon>
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent className="overflow-y-scroll h-80 w-120">
              {!selectedGroup && 
                <div className="flex flex-col gap-2 h-full">
                  {TRANSACTION_CATEGORIES.map((group) => (
                    <Button
                      key={group.id}
                      variant={"outline"}
                      onClick={() => setSelectedGroup(group.id)}
                      className="flex-1 h-20 w-full"
                    >
                      {group.budget_group}
                    </Button>
                  ))}
                </div>
              }
              {selectedGroup && 
              <div>
                <Button onClick={() => setSelectedGroup(null)} className="mb-2 w-full" variant={"outline"}>
                    {"<"} Atrás
                </Button>
                <div className="grid grid-cols-3 gap-2 ">
                  {TRANSACTION_CATEGORIES.find(
                    (group) => group.id === selectedGroup,
                  )?.categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={"outline"}
                      onClick={() => {
                        field.onChange(category.id.toString());
                        setSelectedGroup(null);
                        setOpen(false);
                      }}
                      className="text-xs h-10"
                    >
                      <Icon color="primary" fontSize="small">{formatIcon(category.icon)}</Icon>
                      {category.name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Button>
                  ))}
                </div>
                </div>
              }
            </PopoverContent>
          </Popover>
          {/* <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
