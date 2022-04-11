<template>
  <div class="home">
    <p>Logging you in ...</p>
  </div>
</template>

<script lang="ts">
import { ThreefoldLogin } from '@threefoldjimber/threefold_login/dist';
import {StagingConfig, ProductionConfig, environment} from '@/config/config'
import {defineComponent} from 'vue'
import {Configurations} from "@/enums";

export default defineComponent({
  async setup() {
    let login: ThreefoldLogin;

    switch (environment.value) {
      case Configurations.STAGING:
        login = new ThreefoldLogin(StagingConfig.threefoldBackend,
          StagingConfig.appId,
          StagingConfig.seedPhrase,
          StagingConfig.redirect_url,
          StagingConfig.kycBackend);

        break;

      case Configurations.PRODUCTION:
        login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
          ProductionConfig.appId,
          ProductionConfig.seedPhrase,
          ProductionConfig.redirect_url,
          ProductionConfig.kycBackend);

        break;

      default:
        login = new ThreefoldLogin(ProductionConfig.threefoldBackend,
          ProductionConfig.appId,
          ProductionConfig.seedPhrase,
          ProductionConfig.redirect_url,
          ProductionConfig.kycBackend);
    }

    await login.init();

    const state = window.localStorage.getItem("state") as string
    const redirectUrl = new URL(window.location.href)

    try {
      const profileData = await login.parseAndValidateRedirectUrl(redirectUrl, state);
      window.opener.postMessage({message: 'threefoldLoginRedirectSuccess', profileData: profileData});
      console.log(profileData)
    } catch (e) {
      console.log('This is the error')
      console.error("Error", e)
    }
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
