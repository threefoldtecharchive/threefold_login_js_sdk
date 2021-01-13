<template>
    <div class="home">
        <p>Threefold login example, please choose a type of login</p>
        <div class="buttons">
            <button @click="loginWithCustomScope({email: false})">Authenticate and get the users email.</button>
            <button @click="loginWithCustomScope({phone: false})">Authenticate and get the users phone.</button>
            <button @click="loginWithCustomScope({derivedSeed: false})">Authenticate and get the derived seed.</button>
            <button @click="loginWithCustomScope({email: false, derivedSeed: false})">Authenticate and get the users email and derived seed.</button>
            <button @click="loginWithCustomScope({email: false, phone:false, derivedSeed: false})">Authenticate and get the users email, phone and derived seed.</button>
            <br>
            <button @click="loginWithCustomScope({email: true})">Authenticate and get the users email.[Mandatory]</button>
            <button @click="loginWithCustomScope({phone: true})">Authenticate and get the users phone.[Mandatory]</button>
            <button @click="loginWithCustomScope({derivedSeed: true})">Authenticate and get the derived seed.[Mandatory]</button>
            <button @click="loginWithCustomScope({email: true, derivedSeed: true})">Authenticate and get the users email and derived seed.[Mandatory]</button>
            <button @click="loginWithCustomScope({email: true, phone:true, derivedSeed: true})">Authenticate and get the users email, phone and derived seed.[Mandatory]</button>
        </div>


      <div>
        <p>Login object</p>
        <pre>{{profile}}</pre>

        <p>Email object (Valid if it contains data)</p>
        <pre>{{signedEmailIdentifier}}</pre>

        <p>Phone object (Valid if it contains data)</p>
        <pre>{{signedPhoneIdentifier}}</pre>
      </div>

    </div>
</template>

<script lang="ts">
    import { generateRandomString, ThreefoldLogin } from '@threefoldjimber/threefold_login/dist';
    import { appId, kycBackend, redirect_url, seedPhrase, threefoldBackend } from '@/config/config';
    import { defineComponent, ref } from 'vue';

    const profile = ref({});
    const signedEmailIdentifier = ref({});
    const signedPhoneIdentifier = ref({});

    const popupCenter = (url: string, title: string, w: number, h: number) => {
        // Fixes dual-screen position                             Most browsers      Firefox
        const dualScreenLeft = window.screenLeft !==  undefined ? window.screenLeft : window.screenX;
        const dualScreenTop = window.screenTop !==  undefined   ? window.screenTop  : window.screenY;

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
                if (sei){
                    console.log("SEI. ", sei)
                  signedPhoneIdentifier.value = await login.verifySignedEmailIdenfier(sei)
                }
              const spi = e.data.profileData?.profile?.email?.spi;
              if (spi){
                console.log("SPI. ", spi)
                signedPhoneIdentifier.value = await login.verifySignedPhoneIdenfier(spi)
              }
                popup?.close();
            }
        };
    }

    export default defineComponent({
        setup() {
            return { loginWithCustomScope, profile, signedEmailIdentifier, signedPhoneIdentifier }
        }
    })
</script>

<style>
    button {
        display: block;
        padding: 5px;
        margin: 10px;
        width: 100%;

    }
</style>
