import { get, post, del } from "./client";
import type { User } from "../types";

export async function getUsers(): Promise<User[]> {
  return get<User[]>("/api/users");
}

export async function createUser(body: { name: string }): Promise<User> {
  return post<User>("/api/users", body);
}

export async function deleteUser(id: number): Promise<void> {
  return del(`/api/users/${id}`);
}
