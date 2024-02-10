import { z } from "zod";

export interface IProxyIdentity {
  piid: string,
};

export const ProxyIdentity = z.object({
  piid: z.string(),
  name: z.string(),
});

export interface INamedProxyIdentity extends IProxyIdentity {
  name: string,
};

export const NamedProxyIdentity = z.object({
  piid: z.string(),
  name: z.string(),
});
