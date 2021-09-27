# Threefold Connect Login sdk 

##install
npm

`npm install --save @threefoldjimber/threefold_login`

yarn

`yarn add @threefoldjimber/threefold_login`


##usage

Get a LoginUrl
```js 
import { ThreefoldLogin, generateRandomString } from '@threefoldjimber/threefold_login';

/***/

const threeFoldAPIHost = "{{host endpoint}}";
const appId = "{{your appId}}"; // should always be your domain (eg myapp.com)
const seedPhrase = "{{seedphrase}}"; // the secret of your app; preferably a backend secret.
const redirectUrl = 'url to redirect'; // not full url, only the path eg '/callback'

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
import { ThreefoldLogin } from '@threefoldjimber/threefold_login';

/***/

const threeFoldAPIHost = "{{host endpoint}}";
const appId = "{{your appId}}";
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
