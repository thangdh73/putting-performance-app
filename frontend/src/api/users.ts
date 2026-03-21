import { get } from "./client";
import type { User } from "../types";

export async function getUsers(): Promise<User[]> {
  return get<User[]>("/api/users");
}
