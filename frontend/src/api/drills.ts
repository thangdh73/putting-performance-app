import { get } from "./client";
import type { Drill } from "../types";

export async function getDrills(): Promise<Drill[]> {
  return get<Drill[]>("/api/drills");
}

export async function getDrill(id: number): Promise<Drill> {
  return get<Drill>(`/api/drills/${id}`);
}
