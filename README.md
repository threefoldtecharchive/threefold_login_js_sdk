# Threefold Connect Login sdk 

##install
npm

`npm install --save @threefoldtech/threefold_login`

yarn

`yarn add @threefoldtech/threefold_login`


##usage

Get a LoginUrl
```js 
import { ThreefoldLogin, generateRandomString } from '@threefoldtech/threefold_login';

/***/

const threeFoldAPIHost = "{{host endpoint}}";
const appId = "{{yo're appId}}";
const seedPhrase = "{{seedphrase}}";
const redirectUrl = 'url to redirect';

const login = ThreefoldLogin( threeFoldAPIHost,
                              appId,
                              seedPhrase,
                              redirectUrl );
await login.init();

const state = generateRandomString();

const loginUrl = login.generateLoginUrl();
// you can now use this `loginUrl` to redirect or open a window
```

Process redirectUrl
```js 
import { ThreefoldLogin } from '@threefoldtech/threefold_login';

/***/

const threeFoldAPIHost = "{{host endpoint}}";
const appId = "{{yo're appId}}";
const seedPhrase = "{{seedphrase}}";
const redirectUrl = 'url to redirect';

// you can use the same instance as `Get a LoginUrl`
const login = ThreefoldLogin( threeFoldAPIHost,
                              appId,
                              seedPhrase,
                              redirectUrl );
await login.init();

const state = '{{same state as getting login url}}';

const redirectUrl = URL('{{redirectUrl}}')

try {
    const profileData = login.parseAndValidateRedirectUrl(redirectUrl, state);
} catch (e){
    // something went wrong 
}
```
