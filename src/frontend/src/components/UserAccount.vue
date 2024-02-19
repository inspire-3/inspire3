<template>
    <button v-if="!isSignedIn"
            type="button"
            class="rounded-full px-4 min-h-[36px] w-28
                font-poppins font-normal text-primary/50 shadow-sm hover:bg-primary/50 hover:text-primary-content border border-primary/50 hover:border-primary
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary text-base
            ">
        Sign In
    </button>

    <div v-if="isSignedIn"
         class="dropdown dropdown-end mr-2" :class="[componentName]">
        <div tabindex="0" role="button" class="flex avatar pl-4 pr-0">
            <Avatar :fullname="username" :classes="['w-7','h-7' ,'lg:w-10', 'lg:h-10']" />
        </div>
        <ul tabindex="0" class="dropdown-content z-[1] menu mt-2 p-2 shadow bg-base-100 rounded-3xl w-52">
            <li v-if="account" class="menu-title">ProxyIdentities</li>
            <li v-for="piid in account?.data.piids">
                <div v-if="editPiid?.piid !== piid.piid" class="flex">
                    <button v-if="!isActive(piid, selectedPiid)" @click="selectPiid(piid)" class="flex-grow text-left">
                        {{ piid.name }}
                    </button>
                    <a v-if="isActive(piid, selectedPiid)" :href="'/proxy-identities/' + piid.piid" class="flex-grow">{{
                        piid.name }}</a>
                    <!-- TODO: replace emoji with font icon -->
                    <span v-if="isActive(piid, selectedPiid)">👈</span>
                    <a @click="editPiid = piid">✏️ </a>
                    <a :href="'/proxy-identities/' + piid.piid">📋</a> <!-- TODO: implement copy to clipboard -->
                </div>
                <!-- edit mode -->
                <div v-if="editPiid?.piid === piid.piid" class="flex menu-title">
                    <!-- TODO: autofocus when edit mode is activated -->
                    <input @input="event => setPiidName({ ...piid, name: ((event.target as any)?.value ?? piid.name) })"
                        type="text" :value="piid.name" class="flex-grow w-10 input mr-2 p-1" />
                    <span @click="saveAccount()" class="btn mr-[-10px]">✔️ </span>
                </div>
            </li>
            <li v-if="account">
                <button @click="newPiidEdit" class="btn btn-slim m-2">➕</button>
            </li>
            <li v-if="!account" class="menu-title text-center">
                Loading...
            </li>
            <li>
                <hr />
            </li>
            <li>
                <button @click="logout" class="text-center">Sign out</button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { init, login, logout} from '../junoHelper'
import type { Doc, User } from '@junobuild/core-peer'
import type { IUserAccount } from '../contracts/IUserAccount'
import type { INamedProxyIdentity, IProxyIdentity } from '../contracts/IProxyIdentity'
import { urlAlphabet, customAlphabet } from 'nanoid'
const nanoid = customAlphabet(urlAlphabet, 32);

export const componentName = 'UserAccount'
export default defineComponent({
    name: componentName,
})
</script>

<script lang="ts" setup>
import Avatar from './Avatar.vue'
import { ref } from 'vue'
import { authSubscribe, getDoc, setDoc } from '@junobuild/core-peer'

const isSignedIn = ref(false);
const user = ref<null | User>(null);
const account = ref<Doc<IUserAccount> | null>(null);
const editPiid = ref<INamedProxyIdentity | null>(null);
const selectedPiid = ref<IProxyIdentity | null>(null);

init();

{
    const piid = window.localStorage.getItem('IN3-UserAccount-PIID');
    if (piid) selectedPiid.value = { piid };
}

const selectPiid = (piid: INamedProxyIdentity) => {
    selectedPiid.value = piid;
    window.localStorage.setItem("IN3-UserAccount-PIID", piid.piid);
};

const loadAccount = async (user: User) => {
    // TODO: handle error from getDoc and setDoc
    let doc = await getDoc<IUserAccount>({
        collection: 'user_account',
        key: user.key,
    })

    if (!doc) {
        const data: Doc<IUserAccount> = {

            key: user.key, // random id
            data: {
                piids: [createPiid()], // proxyIdentityIds
                state: 'active',
            },
            owner: user.key,  // IdentityId Principle
            description: '', // can be empty because every principle sees only his own entries, except controllers
        }
        console.log("create new user account", data);
        doc = await setDoc({
            collection: 'user_account',
            doc: data,
        })
    }

    console.log("user accound loaded", doc);
    account.value = doc;
}

const saveAccount = async () => {
    let data = account.value;
    if (!data) throw "saveAccount called but account is not set";

    editPiid.value = null;

    const doc = await setDoc({
        collection: 'user_account',
        doc: data,
    })
    console.log("user account saved", doc)
}

// Creates a new ProxyIdentity and activate editing
const createPiid = (): INamedProxyIdentity => {
    let name = "P" + nanoid(5);
    return { name, piid: name + nanoid(32 - 5) };
}

/// Add or update a PIID in account
const setPiidName = (piid: { piid: string, name: string }) => {
    let acc = account.value;
    if (!acc) throw "setPiidName called but account is not set";

    const index = acc.data.piids.findIndex((p) => p.piid === piid.piid);
    if (index >= 0) {
        acc.data.piids[index] = piid;
    } else {
        acc.data.piids.push(piid)
    }
}

const newPiidEdit = () => {
    const piid = createPiid();
    setPiidName(piid);
    editPiid.value = piid;
}

authSubscribe((u) => {
    isSignedIn.value = u !== null;
    user.value = u;
    if (u !== null) {
        loadAccount(u);
    }
})

const isActive = (piid: IProxyIdentity, active: IProxyIdentity | null): boolean => {
    return active?.piid === piid.piid;
}

const username = 'Jon Doe'
</script>
