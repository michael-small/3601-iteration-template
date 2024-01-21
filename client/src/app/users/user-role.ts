import { JTDSchemaType } from "ajv/dist/jtd";

export type UserRole = 'admin' | 'editor' | 'viewer';

export const userRoleSchema: JTDSchemaType<UserRole> = {
  enum: ["admin", "editor", "viewer"]
};
