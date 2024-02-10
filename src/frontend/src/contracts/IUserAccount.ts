import type { INamedProxyIdentity } from "./IProxyIdentity";
import { z } from "zod";

export interface IUserAccount {
  piids: INamedProxyIdentity[], // proxyIdentityIds
  state: 'active' | 'inactive',
}

// Parser for UserAccount
// usage example: const account = UserAccount.parse(res.data);
export const UserAccount = z.object(
  {
    piids: z.array(z.string()),
    state: z.union([z.literal("active"), z.literal("inactive")])
  }
)
