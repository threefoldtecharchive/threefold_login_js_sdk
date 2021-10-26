<template>
  <div class="home">
    <h2>Threefold login example, please choose a type of login</h2>
    <br>

    <div style="text-align: left; width: 50%; margin: auto">
      <span> All scopes </span>
      <input type="checkbox" v-model="selectedAllValue" :checked="selectedAllValue"/>
    </div>

    <br>
    <div class="flex-container">
      <span style="font-size: 18px; font-weight: 600; width: 40%">Item</span>
      <span style="font-size: 18px; font-weight: 600; width: 30%; text-align: center">Add to scope</span>
      <span style="font-size: 18px; font-weight: 600; width: 30%; text-align: center">Mandatory</span>
    </div>

    <div v-for="item in items" class="flex-container" style="padding: 10px">
      <span style="font-size: 16px; width: 40%"> {{ item.value }}</span>
      <div style="width: 30%; text-align: center">
        <input :checked="dictScopes[item.value] !== undefined" type="checkbox" @change="toggleScope(item)">
      </div>
      <div style="width: 30%; text-align: center">
        <input :checked="dictScopes[item.value] && dictScopes[item.value] === true" type="checkbox"
               @change="toggleMandatory(item)">
      </div>
    </div>
    <div class="flex-container">
      <input style="padding: 5px" @keyup.enter="addToScope" v-model="scopeName" type="text">
      <div></div>
      <div></div>
    </div>

    <br>
    <div>
      <h3>Scope object</h3>
      {{ dictScopes }}
    </div>

    <br>
    <br>

    <input class="button" type="submit" @click="loginWithCustomScope(dictScopes)" value="Send request">


    <div>
      <br>
      <h3>Login object</h3>
      <pre>{{ profile }}</pre>

      <br>
      <h3>Email object (Valid if it contains data)</h3>
      <pre>{{ signedEmailIdentifier }}</pre>

      <br>
      <h3>Phone object (Valid if it contains data)</h3>
      <pre>{{ signedPhoneIdentifier }}</pre>

      <br>
      <h3>Identity Name  (Valid if it contains data)</h3>
      <pre>{{ signedIdentityNameIdentifier }}</pre>

      <br>
      <h3>Identity Gender  (Valid if it contains data)</h3>
      <pre>{{ signedIdentityGenderIdentifier }}</pre>

      <br>
      <h3>Identity Document Meta  (Valid if it contains data)</h3>
      <pre>{{ signedIdentityDocumentMetaIdentifier }}</pre>

      <br>
      <h3>Identity Country  (Valid if it contains data)</h3>
      <pre>{{ signedIdentityCountryIdentifier }}</pre>

      <br>
      <h3>Identity DOB  (Valid if it contains data)</h3>
      <pre>{{ signedIdentityDOBIdentifier }}</pre>
    </div>

  </div>
</template>

<script lang="ts">
import {generateRandomString, ThreefoldLogin} from '../../../src/index';
import {appId, kycBackend, redirect_url, seedPhrase, threefoldBackend} from '@/config/config';
import {defineComponent, ref, watch} from 'vue';
import type {Scope} from "@/types/home";

const profile = ref({});
const signedEmailIdentifier = ref({});
const signedPhoneIdentifier = ref({});
const signedIdentityNameIdentifier = ref({});
const signedIdentityGenderIdentifier = ref({});
const signedIdentityCountryIdentifier = ref({});
const signedIdentityDocumentMetaIdentifier = ref({});
const signedIdentityDOBIdentifier = ref({});

const dictScopes = ref<any>({})
const scopeName = ref<string>('');
const selectedAllValue = ref<boolean>(false);


const items = ref([
  {
    "value": "doubleName",
  },
  {
    "value": "derivedSeed",
  },
  {
    "value": "email",
  },
  {
    "value": "phone",
  },
  {
    "value": "identityName",
  },
  {
    "value": "identityDOB",
  },
  {
    "value": "identityCountry",
  },
  {
    "value": "identityDocumentMeta",
  },
  {
    "value": "identityGender",
  },
  {
    "value": "walletAddress",
  },
  {
    "value": "digitalTwin",
  },
])


const popupCenter = (url: string, title: string, w: number, h: number) => {
  // Fixes dual-screen position                             Most browsers      Firefox
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

  const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  const systemZoom = width / window.screen.availWidth;
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop
  const newWindow = window.open(url, title,
    `
      scrollbars=yes,
      width=${w / systemZoom},
      height=${h / systemZoom},
      top=${top},
      left=${left}
      `
  )

  if (newWindow) newWindow.focus();

  return newWindow
}


// TODO: make types
const toggleScope = async (item: Scope) => {
  let selectedItem = dictScopes.value.hasOwnProperty(item.value)

  if (!selectedItem) {
    return dictScopes.value[item.value] = false
  }

  if (dictScopes.value[item.value] == false || dictScopes.value[item.value] == true) {
    return delete dictScopes.value[item.value]
  }
}

const toggleMandatory = async (item: Scope) => {
  let selectedItem = dictScopes.value.hasOwnProperty(item.value)

  if (selectedItem == undefined) {
    return dictScopes.value[item.value] = true
  }

  return dictScopes.value[item.value] = !dictScopes.value[item.value]

}

const addToScope = () => {
  items.value.push({'value': scopeName.value})
  dictScopes.value[scopeName.value] = true
}

const loginWithCustomScope = async (scope: Record<string, boolean>) => {
  const login = new ThreefoldLogin(threefoldBackend,
    appId,
    seedPhrase,
    redirect_url,
    kycBackend);

  await login.init();

  const state = generateRandomString();

  const extraParams = {
    scope: JSON.stringify(scope),
  };


  window.localStorage.setItem("state", state)
  const loginUrl = login.generateLoginUrl(state, extraParams);

  const popup = popupCenter(loginUrl, 'Threefold login', 800, 550);

  window.onmessage = async (e: MessageEvent) => {
    if (e.data.message === 'threefoldLoginRedirectSuccess') {
      profile.value = e.data.profileData
      const sei = e.data.profileData?.profile?.email?.sei;
      if (sei) {
        console.log("SEI. ", sei)
        signedEmailIdentifier.value = await login.verifySignedEmailIdenfier(sei)
      }
      const spi = e.data.profileData?.profile?.phone?.spi;
      if (spi) {
        console.log("SPI. ", spi)
        signedPhoneIdentifier.value = await login.verifySignedPhoneIdenfier(spi)
      }

      const sIdentityNameIdentifier =  e.data.profileData?.profile?.identityName?.signedIdentityNameIdentifier
      if (sIdentityNameIdentifier) {
        console.log("Signed Identity Name Identifier. ", signedIdentityNameIdentifier)
        signedIdentityNameIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityNameIdentifier', sIdentityNameIdentifier)
      }

      const sIdentityGenderIdentifier =  e.data.profileData?.profile?.identityGender?.signedIdentityGenderIdentifier
      if (sIdentityGenderIdentifier) {
        console.log("Signed Identity Gender Identifier. ", sIdentityGenderIdentifier)
        signedIdentityGenderIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityGenderIdentifier', sIdentityGenderIdentifier)
      }

      const sIdentityDOBIdentifier =  e.data.profileData?.profile?.identityDOB?.signedIdentityDOBIdentifier
      if (sIdentityDOBIdentifier) {
        console.log("Signed Identity DOB Identifier. ", sIdentityDOBIdentifier)
        signedIdentityDOBIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityDOBIdentifier', sIdentityDOBIdentifier)
      }

      const sIdentityCountryIdentifier =  e.data.profileData?.profile?.identityCountry?.signedIdentityCountryIdentifier
      if (sIdentityCountryIdentifier) {
        console.log("Signed Identity Country Identifier. ", sIdentityCountryIdentifier)
        signedIdentityCountryIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityCountryIdentifier', sIdentityCountryIdentifier)
      }

      const sIdentityDocumentMetaIdentifier =  e.data.profileData?.profile?.identityDocumentMeta?.signedIdentityDocumentMetaIdentifier
      if (sIdentityDocumentMetaIdentifier) {
        console.log("Signed Identity DocumentMeta Identifier. ", sIdentityDocumentMetaIdentifier)
        signedIdentityDocumentMetaIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityDocumentMetaIdentifier', sIdentityDocumentMetaIdentifier)
      }

      popup?.close();
    }
  };
}

watch(selectedAllValue, (isSelected, prevSelection) => {
  if(isSelected) {
     return items.value.forEach(item  => {
       dictScopes.value[item.value] = true
    })
  }

  return items.value.forEach(item  => {
    delete dictScopes.value[item.value]
  })


})


export default defineComponent({
  setup() {
    return {
      profile,
      signedEmailIdentifier,
      signedPhoneIdentifier,
      signedIdentityNameIdentifier,
      signedIdentityGenderIdentifier,
      signedIdentityDOBIdentifier,
      signedIdentityCountryIdentifier,
      signedIdentityDocumentMetaIdentifier,
      items,
      dictScopes,
      scopeName,
      selectedAllValue,
      addToScope,
      loginWithCustomScope,
      toggleScope,
      toggleMandatory,

    }
  }
})
</script>

<style>
.flex-container {
  width: 50%;
  margin: auto;
  justify-content: space-between;
  display: flex;
  align-items: center;
  text-align: left;
}

.button {
  display: block;
  padding: 15px;
  margin: auto;
  background: #2c3e50;
  color: white;
  border: none;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;

}
</style>
