<template>

</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ThreefoldLogin} from "@threefoldjimber/threefold_login/dist";
import {environment, ProductionConfig, StagingConfig} from "@/config/config";
import {Configurations} from "@/enums";
import router from "@/router";

export default defineComponent({
   async setup () {
     console.log(router.currentRoute.value.query)

     console.log(router.currentRoute.value.query['error'])
     if (router.currentRoute.value.query['error']) {
       window.opener.postMessage({message: 'threefoldSignCancel'});
       return;
     }

     let login: ThreefoldLogin;

     switch (environment.value) {
       case Configurations.STAGING:
         login = new ThreefoldLogin(StagingConfig.threefoldBackend,
           StagingConfig.appId,
           StagingConfig.seedPhrase,
           '/callbackSign',
           StagingConfig.kycBackend);

         break;

       case Configurations.PRODUCTION:
         login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
           ProductionConfig.appId,
           ProductionConfig.seedPhrase,
           '/callbackSign',
           ProductionConfig.kycBackend);

         break;

       default:
         login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
           ProductionConfig.appId,
           ProductionConfig.seedPhrase,
           '/callbackSign',
           ProductionConfig.kycBackend);
     }

     await login.init();

     const state = window.localStorage.getItem("state") as string
     const redirectUrl = new URL(window.location.href)

     try {
       console.log('Trying this')
       const profileData = await login.parseAndValidateRedirectUrlForSigning(redirectUrl, state);

       window.opener.postMessage({message: 'threefoldSignRedirectSuccess', profileData: profileData});

     } catch (e) {
       console.log('This is the error')
       console.error("Error", e)
     }
   }

})
</script>

<style scoped>

</style>
