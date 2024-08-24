import { HugeiconsProps } from "@hugeicons/react";
import { FC, RefAttributes } from "react";

export type HugeIcon = FC<
  Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>
>;
