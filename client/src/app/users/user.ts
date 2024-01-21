import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
import { UserRole, userRoleSchema } from "./user-role";

export interface User {
  _id?: string;
  name: string;
  age: number;
  company: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

const userSchema: JTDSchemaType<User> = {
  properties: {
    name: {type: "string"},
    age: {type: "uint8"},
    company: {type: "string"},
    email: {type: "string"},
    role: userRoleSchema
  },
  optionalProperties: {
    _id: {type: "string"},
    avatar: {type: "string"},
  }
}

const ajv = new Ajv()
export const validateUser = ajv.compile(userSchema)
