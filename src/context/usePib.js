import { useContext } from "react";
import { PibContext } from "./PibContext";

export function usePib() {
  const context = useContext(PibContext);
  if (!context) {
    throw new Error("usePib deve ser usado dentro de um PibProvider");
  }
  return context;
}
