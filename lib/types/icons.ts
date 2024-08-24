import { HugeiconsProps } from "@hugeicons/react";
import { LucideProps } from "lucide-react";
import { FC, ForwardRefExoticComponent, RefAttributes } from "react";

export type HugeIcon = FC<
  Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export type LucideIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;
