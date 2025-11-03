import * as MuiIcons from "@mui/icons-material";

export const Icon = ({ name, className }: { name: string; className?: string }) => {
  const formatedName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const IconComponent = (MuiIcons as any)[formatedName];
  return IconComponent ? (
    <div className={className}>
      <IconComponent className={className} fontSize="inherit" />
    </div>
  ) : null;
};