import {useLocalStorage} from "@vueuse/core";
import {Configurations} from "@/enums";

export const ProductionConfig =  {
  threefoldBackend: 'https://login.threefold.me',
  kycBackend: 'https://openkyc.live',
  redirect_url: '/callback',
  appId: window.location.host,
  seedPhrase: 'calm science teach foil burst until next mango hole sponsor fold bottom cousin push focus track truly tornado turtle over tornado teach large fiscal'

}

export const StagingConfig =  {
  threefoldBackend:  'https://loginv2.staging.jimber.io',
  kycBackend: 'https://openkyc.staging.jimber.io',
  redirect_url: '/callback',
  appId: window.location.host,
  seedPhrase: 'calm science teach foil burst until next mango hole sponsor fold bottom cousin push focus track truly tornado turtle over tornado teach large fiscal'

}

export const environment = useLocalStorage<Configurations>('environment', Configurations.STAGING);
