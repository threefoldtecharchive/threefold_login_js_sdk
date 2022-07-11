<template>
  <div class="home">
    <div style="display: flex; width: 100%; justify-content: flex-end; align-items: center">
      <div style="margin-right: 16px">
        <input type="radio" id="one" :value="Configurations.STAGING" v-model="environment">
        <label for="one">Staging</label>
      </div>
      <div>
        <input type="radio" id="two" :value="Configurations.PRODUCTION" v-model="environment">
        <label for="two">Production</label>
      </div>
    </div>


    <h2>THREEFOLD SIGN DATA</h2>
    <br>
    <br>

    <div class="flex-container">
      <div></div>
      <div></div>
      <div style="width: 30%; text-align: center"><span
        style="font-size: 18px; font-weight: 600; width: 30%; text-align: center">Is JSON</span></div>
    </div>

    <div class="flex-container">
      <div style="width: 30%; text-align: center">URL</div>
      <input style="padding: 5px;  width: 30%; text-align: center" @keyup.enter="" v-model="signDataValue">
      <div style="width: 30%; text-align: center"><input style="text-align: center" type="checkbox" v-model="isJsonUrl">
      </div>
    </div>
    <br>
    <div class="flex-container">
      <div style="width: 30%; text-align: center">Friendly name</div>
      <input style="padding: 5px;  width: 30%; text-align: center" @keyup.enter="" v-model="friendlyNameDataValue">
      <div style="width: 30%; text-align: center"></div>
    </div>
    <br>
    <br>
    <h3>Data object</h3>
    <span>{"dataUrl" : "{{ signDataValue }}", "isJson": "{{
        isJsonUrl
      }}", "friendlyName" : "{{ friendlyNameDataValue }}"}</span>
    <br>
    <br>
    <input class="button" type="submit" @click="signDataFromUrl(signDataValue)" value="Send request">
    <br>
    <br>
    <div>
      <h3>SIGNED DATA</h3>
      <pre>{{ signedData }}</pre>
    </div>

    <br>

    <div>
      <h4>Is valid hash</h4>
      <div v-if="isValidHash === true">
        <span style="color: green">Hash has been validated</span>
      </div>
      <div v-else-if="isValidHash === false">
        <span style="color: red">Hash mismatch</span>
      </div>
      <div v-else>
        Unknown
      </div>
    </div>
    <hr>
    <br>

    <h2>THREEFOLD LOGIN</h2>
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
    <hr>
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
      <h3>Identity Name (Valid if it contains data)</h3>
      <pre>{{ signedIdentityNameIdentifier }}</pre>

      <br>
      <h3>Identity Gender (Valid if it contains data)</h3>
      <pre>{{ signedIdentityGenderIdentifier }}</pre>

      <br>
      <h3>Identity Document Meta (Valid if it contains data)</h3>
      <pre>{{ signedIdentityDocumentMetaIdentifier }}</pre>

      <br>
      <h3>Identity Country (Valid if it contains data)</h3>
      <pre>{{ signedIdentityCountryIdentifier }}</pre>

      <br>
      <h3>Identity DOB (Valid if it contains data)</h3>
      <pre>{{ signedIdentityDOBIdentifier }}</pre>
    </div>

  </div>
</template>

<script lang="ts">
import {generateRandomString, ThreefoldLogin} from "@threefoldjimber/threefold_login/dist";
import {environment, ProductionConfig, StagingConfig,} from '@/config/config';
import type {Scope} from "@/types/home";
import {Configurations} from "@/enums";
import {defineComponent, ref, watch} from "vue";
import {hashData} from "../../../src/utils/crypto";
import axios from "axios";

const profile = ref({});
const signedEmailIdentifier = ref({});
const signedPhoneIdentifier = ref({});
const signedIdentityNameIdentifier = ref({});
const signedIdentityGenderIdentifier = ref({});
const signedIdentityCountryIdentifier = ref({});
const signedIdentityDocumentMetaIdentifier = ref({});
const signedIdentityDOBIdentifier = ref({});
const signedData = ref<any>({});
const isJsonUrl = ref<boolean>(false)

const dictScopes = ref<any>({})
const scopeName = ref<string>('');
const selectedAllValue = ref<boolean>(false);

const signDataValue = ref<string>('');
const friendlyNameDataValue = ref<string>('');

const isValidHash = ref<boolean>();

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
  dictScopes.value[scopeName.value] = false
}

const signDataFromUrl = async (dataUrl: string) => {
  let login: ThreefoldLogin;

  switch (environment.value) {
    case Configurations.STAGING:
      login = new ThreefoldLogin(StagingConfig.threefoldBackend,
        StagingConfig.appId,
        StagingConfig.seedPhrase,
        'callbackSign',
        StagingConfig.kycBackend)

      break;

    case Configurations.PRODUCTION:
      login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
        ProductionConfig.appId,
        ProductionConfig.seedPhrase,
        'callbackSign',
        ProductionConfig.kycBackend)

      break;

    default:
      login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
        ProductionConfig.appId,
        ProductionConfig.seedPhrase,
        'callbackSign',
        ProductionConfig.kycBackend)

      break;
  }

  const state = generateRandomString();

  window.localStorage.setItem("state", state)

  const hashedUrl: string = hashData(signDataValue.value);

  const urlContent: string = await getContentFromUrl(dataUrl);

  if (!urlContent) {
    console.error('Enter valid url')
    return;
  }

  let hashContent: string;

  if (isJsonUrl.value) {
    hashContent = hashData(JSON.stringify(urlContent));
  } else {
    hashContent = hashedUrl
  }


  const signUrl = login.generateSignUrl(state, hashContent, signDataValue.value, isJsonUrl.value, friendlyNameDataValue.value, login.redirectUrl)

  const popup = popupCenter(signUrl, 'Threefold login', 800, 550);

  window.onmessage = async (e: MessageEvent) => {
    console.log(e.data.message)
    if (e.data.message == 'threefoldSignRedirectSuccess') {
      const signedDataMessage = e.data.profileData?.profile?.signedData
      if (signedDataMessage) {
        console.log("signedData. ", signedDataMessage)
        signedData.value = e.data.profileData?.profile

        if (isJsonUrl.value) {
          isValidHash.value = !!(signedData.value['hashedData'] && signedData.value['hashedData'].toString() === hashContent);
        } else {
          isValidHash.value = !!(signedData.value['hashedData'] && signedData.value['hashedData'].toString() === hashedUrl);
        }
      }

      popup?.close();
    }

    if (e.data.message == 'threefoldSignCancel') {
      popup?.close();
    }
  };
}


const getContentFromUrl = async (url: string): Promise<any> => {
  try {
    const res = await axios.get(url)
    return res.data
  } catch (e) {
    return null;
  }
}


const loginWithCustomScope = async (scope: Record<string, boolean>) => {
  let login: ThreefoldLogin;

  switch (environment.value) {
    case Configurations.STAGING:
      login = new ThreefoldLogin(StagingConfig.threefoldBackend,
        StagingConfig.appId,
        StagingConfig.seedPhrase,
        StagingConfig.redirect_url,
        StagingConfig.kycBackend)

      break;

    case Configurations.PRODUCTION:
      login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
        ProductionConfig.appId,
        ProductionConfig.seedPhrase,
        ProductionConfig.redirect_url,
        ProductionConfig.kycBackend)

      break;

    default:
      login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
        ProductionConfig.appId,
        ProductionConfig.seedPhrase,
        ProductionConfig.redirect_url,
        ProductionConfig.kycBackend)

      break;
  }

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

      const sIdentityNameIdentifier = e.data.profileData?.profile?.identityName?.signedIdentityNameIdentifier
      if (sIdentityNameIdentifier) {
        console.log("Signed Identity Name Identifier. ", signedIdentityNameIdentifier)
        signedIdentityNameIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityNameIdentifier', sIdentityNameIdentifier)
      }

      const sIdentityGenderIdentifier = e.data.profileData?.profile?.identityGender?.signedIdentityGenderIdentifier
      if (sIdentityGenderIdentifier) {
        console.log("Signed Identity Gender Identifier. ", sIdentityGenderIdentifier)
        signedIdentityGenderIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityGenderIdentifier', sIdentityGenderIdentifier)
      }

      const sIdentityDOBIdentifier = e.data.profileData?.profile?.identityDOB?.signedIdentityDOBIdentifier
      if (sIdentityDOBIdentifier) {
        console.log("Signed Identity DOB Identifier. ", sIdentityDOBIdentifier)
        signedIdentityDOBIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityDOBIdentifier', sIdentityDOBIdentifier)
      }

      const sIdentityCountryIdentifier = e.data.profileData?.profile?.identityCountry?.signedIdentityCountryIdentifier
      if (sIdentityCountryIdentifier) {
        console.log("Signed Identity Country Identifier. ", sIdentityCountryIdentifier)
        signedIdentityCountryIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityCountryIdentifier', sIdentityCountryIdentifier)
      }

      const sIdentityDocumentMetaIdentifier = e.data.profileData?.profile?.identityDocumentMeta?.signedIdentityDocumentMetaIdentifier
      if (sIdentityDocumentMetaIdentifier) {
        console.log("Signed Identity DocumentMeta Identifier. ", sIdentityDocumentMetaIdentifier)
        signedIdentityDocumentMetaIdentifier.value = await login.verifySignedIdentityIdentifier('signedIdentityDocumentMetaIdentifier', sIdentityDocumentMetaIdentifier)
      }

      popup?.close();
    }
  };
}

watch(selectedAllValue, (isSelected: boolean, prevSelection: boolean) => {
  if (isSelected) {
    return items.value.forEach((item: any) => {
      dictScopes.value[item.value] = false
    })
  }

  return items.value.forEach((item: any) => {
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
      environment,
      signDataValue,
      isJsonUrl,
      signedData,
      friendlyNameDataValue,
      Configurations,
      isValidHash,
      addToScope,
      loginWithCustomScope,
      toggleScope,
      toggleMandatory,
      signDataFromUrl,

    }
  }
})
</script>

<style>
.home {
  padding: 18px;
}

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
