import { AnonymousIdentity, type Identity } from "@dfinity/agent";
import { initJuno, type Satellite, setDoc, type Doc } from "@junobuild/core";
import { signIn, NFIDProvider, signOut } from "@junobuild/core";
export { getDoc, setDoc, authSubscribe } from "@junobuild/core";

import { nanoid } from "nanoid";

export type AnonWritableCollection = "test";
export type WritableCollection = AnonWritableCollection | "user_account" | "read_status" | "hidden_status" | "topics" | "test";

// TODO: delete the next line and the dummy values for wip testing
const DELETEME = false;
const SATELITE_ID = DELETEME ? "qt5bo-kqaaa-aaaal-adrwa-cai" : import.meta.env.PUBLIC_SATELLITE_ID;
const IS_IN_JUNO_CONTAINER = DELETEME ? false : import.meta.env.DEV

export const setDocAnon = async (data: { collection: AnonWritableCollection, doc: { data: unknown, key?: string } }) => {
  const identity: Identity = new AnonymousIdentity();

  const satellite: Partial<Satellite> = {
    identity: identity as any, // TODO: import @dfinity/agent is differnt from the agent used in @junobuild/core
    satelliteId: SATELITE_ID
  };

  const key = data.doc.key ?? nanoid();

  const doc = {
    ...data.doc,
    key
  };

  return await setDoc({
    ...data,
    satellite,
    doc,
  });
}

export const login = () => {
  return signIn({
    provider: new NFIDProvider({
      appName: "Inspire3",
      logoUrl: "https://inspire3.space/logo.png"
    }),
    maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
    // TODO: test in production
    //derivationOrigin: import.meta.env.DEV ? undefined : import.meta.env.SITE
  });
};

export const logout = () => {
  return signOut();
}

export const init = () => {
  return initJuno({
    satelliteId: SATELITE_ID,
    // probably means use 'http://127.0.0.1:5987' in DEV instead of 'https://icp-api-io'
    // s. https://github.com/junobuild/juno-js/blob/9448afad39aa9320c9918f7139bcfb97a93eaf6c/packages/admin/src/utils/actor.utils.ts#L32
    container: IS_IN_JUNO_CONTAINER,
  });
}
