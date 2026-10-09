import { Monitor, Printer, Cpu, QrCode, type LucideIcon } from "lucide-react";

export const EQUIPMENT = ["printer", "monitor", "pc", "qr_printer"] as const;
export type Equipment = (typeof EQUIPMENT)[number];
export const EQ_ICON: Record<Equipment, LucideIcon> = { printer: Printer, monitor: Monitor, pc: Cpu, qr_printer: QrCode };

export const SYMPTOMS: Record<Equipment, string[]> = {
  printer: ["noPower", "jam", "blurry", "noise"],
  monitor: ["noPower", "black", "noise"],
  pc: ["noPower", "black", "noise"],
  qr_printer: ["noPower", "qr", "jam", "blurry"],
};

export type Status = "pending" | "refused" | "accepted" | "awaiting_repair" | "in_repair" | "repaired" | "unrepairable";
export const FLOW: Status[] = ["pending", "accepted", "awaiting_repair", "in_repair"];

/** Allowed next statuses — mirrors the database trigger. */
export const NEXT: Record<Status, Status[]> = {
  pending: ["accepted", "refused"],
  accepted: ["awaiting_repair"],
  awaiting_repair: ["in_repair"],
  in_repair: ["repaired", "unrepairable"],
  refused: [],
  repaired: [],
  unrepairable: [],
};

export const STATUS_FR: Record<Status, string> = {
  pending: "En attente d'acceptation",
  refused: "Refusée",
  accepted: "Acceptée",
  awaiting_repair: "Équipement reçu",
  in_repair: "En réparation",
  repaired: "Réparé",
  unrepairable: "Non réparable",
};
