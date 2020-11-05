import { generateKeyPair, getEdPkInCurve } from '../../src/utils/crypto';
import { KeyPair, ready } from 'libsodium-wrappers';
import { ThreefoldLogin, generateRandomSeedPhrase } from '../../src';
import { parseSignedAttemptFromUrl } from '../../src/utils/parse';

const protocol = 'https:';

// const rawHost = 'test-bot-front-end.io';
const rawHost = 'login.staging.jimber.org';

const threeFoldAPIHost = protocol + '//' + rawHost;
const appId = 'test.threefoldlogin';

const seedPhrase =
    'adjust cabin jacket brick merge please inflict charge among genius boost vibrant';
const redirectUrl = 'https://test-bot-front-end.io';

let login: ThreefoldLogin;
let state: string;

const testState = 'glsqIjWpvX24tpT6A3xbmvbr5FBJh1Pn';
const testRedirectUrl =
    'https://test.threefoldlogin/https://test-bot-front-end.io?signedAttempt=%7B%22signedAttempt%22%3A%228cEon%2FMJXK%2FyJpQCICwRIXhbfsFJ5Nd58mefpVYrEyQx%2BzKn8vtN8CZCwEptEJ7c%2B5LSzwmDRfkCl9Iai1ATAHsic2lnbmVkU3RhdGUiOiJnbHNxSWpXcHZYMjR0cFQ2QTN4Ym12YnI1RkJKaDFQbiIsImRhdGEiOnsibm9uY2UiOiJRZ3RzWlBZOS9wMkoxRHd6Zkp3c2gvRDNrZHI1NU1CZiIsImNpcGhlcnRleHQiOiJML2g3Y0pra2UyZnhxVU9KS3d2bU16dERidG1rWFJlWmhvZHpIWUEvRFJPU0crUWFudW1kQjgrZmJqL3lycXJpVWJhZ3VYNkZBY0RaIn0sInNlbGVjdGVkSW1hZ2VJZCI6NDAsImRvdWJsZU5hbWUiOiJpZnIuM2JvdCIsInJhbmRvbVJvb20iOiJkMWU4MWU0OS02MDJiLTQ0MTItOTRiYS0wYTkwYTc3MGE1ZjEiLCJhcHBJZCI6InRlc3QudGhyZWVmb2xkbG9naW4ifQ%3D%3D%22%2C%22doubleName%22%3A%22ifr.3bot%22%7D';
const testSignedAttempt =
    '8cEon/MJXK/yJpQCICwRIXhbfsFJ5Nd58mefpVYrEyQx+zKn8vtN8CZCwEptEJ7c+5LSzwmDRfkCl9Iai1ATAHsic2lnbmVkU3RhdGUiOiJnbHNxSWpXcHZYMjR0cFQ2QTN4Ym12YnI1RkJKaDFQbiIsImRhdGEiOnsibm9uY2UiOiJRZ3RzWlBZOS9wMkoxRHd6Zkp3c2gvRDNrZHI1NU1CZiIsImNpcGhlcnRleHQiOiJML2g3Y0pra2UyZnhxVU9KS3d2bU16dERidG1rWFJlWmhvZHpIWUEvRFJPU0crUWFudW1kQjgrZmJqL3lycXJpVWJhZ3VYNkZBY0RaIn0sInNlbGVjdGVkSW1hZ2VJZCI6NDAsImRvdWJsZU5hbWUiOiJpZnIuM2JvdCIsInJhbmRvbVJvb20iOiJkMWU4MWU0OS02MDJiLTQ0MTItOTRiYS0wYTkwYTc3MGE1ZjEiLCJhcHBJZCI6InRlc3QudGhyZWVmb2xkbG9naW4ifQ==';

describe('Crypto', () => {
    beforeAll(async callback => {
        await ready;
        callback();
    }, 1000);

    it('should be able to generate random mnemonic(seedphrase)', () => {
        const mnemonic = generateRandomSeedPhrase();
        expect(mnemonic.split(' ').length).toBe(12);
    }, 1000);

    it('should be able to get a ??? key', async () => {
        const keyPair: KeyPair = await generateKeyPair(seedPhrase);
        const edPkInCurve = getEdPkInCurve(keyPair.publicKey);
        expect(edPkInCurve.length).toBe(44);
    });
});

describe('Parse', () => {
    it('Should parse a raw signed attempt from url', () => {
        const signedAttempt = parseSignedAttemptFromUrl(
            new URL(testRedirectUrl)
        );
        expect(typeof signedAttempt.signedAttempt).toBe('string');
        expect(signedAttempt.signedAttempt).toBe(testSignedAttempt);

        expect(typeof signedAttempt.doubleName).toBe('string');
        expect(signedAttempt.doubleName).toBe('ifr.3bot');
    }, 1000);

    it("Should fail when a url doesn't contain a signed attempt", () => {
        expect(() => {
            parseSignedAttemptFromUrl(new URL(redirectUrl));
        }).toThrow('no signedAttemptParameter');
    }, 1000);
});

describe('ThreefoldLogin', () => {
    beforeEach(async () => {
        login = new ThreefoldLogin(
            threeFoldAPIHost,
            appId,
            seedPhrase,
            redirectUrl
        );
        await login.init();

        state = testState;
    }, 1000);

    it('should be able to be constructed', () => {
        const login = new ThreefoldLogin(
            threeFoldAPIHost,
            appId,
            seedPhrase,
            redirectUrl
        );
        expect(login).toBeInstanceOf(ThreefoldLogin);
    });

    it('should contain threeFoldAPIHost, appId, seedphrase and redirectUrl', () => {
        expect(login.threeFoldAPIHost).toBe(threeFoldAPIHost);
        expect(login.appId).toBe(appId);
        expect(login.seedPhrase).toBe(seedPhrase);
        expect(login.redirectUrl).toBe(redirectUrl);
    });

    it('should return login url', async () => {
        const loginUrl = await login.generateLoginUrl(state);

        // @todo: add better test, parse url and check
        expect(typeof loginUrl).toBe('string');

        const url: URL = new URL(loginUrl);

        expect(url.host).toStrictEqual(rawHost);
        expect(url.protocol).toStrictEqual(protocol);

        const params = url.searchParams;

        expect(params.get('state')).toStrictEqual(state);
        expect(params.get('appid')).toStrictEqual(appId);
        expect(params.get('redirecturl')).toStrictEqual(redirectUrl);

        const keyPair: KeyPair = await generateKeyPair(seedPhrase);
        const publickey = getEdPkInCurve(keyPair.publicKey);

        expect(params.get('publickey')).toStrictEqual(publickey);
    }, 1000);

    it('should return be able to add scope', async () => {
        const scope = JSON.stringify({ doubleName: true, email: false });
        const extraParams = {
            scope,
        };
        const loginUrl = await login.generateLoginUrl(state, extraParams);

        const url: URL = new URL(loginUrl);

        expect(url.host).toStrictEqual(rawHost);
        expect(url.protocol).toStrictEqual(protocol);

        const params = url.searchParams;

        expect(params.get('state')).toStrictEqual(state);
        expect(params.get('appid')).toStrictEqual(appId);
        expect(params.get('redirecturl')).toStrictEqual(redirectUrl);
        expect(params.get('scope')).toStrictEqual(scope);

        const keyPair: KeyPair = await generateKeyPair(seedPhrase);
        const publickey = getEdPkInCurve(keyPair.publicKey);

        expect(params.get('publickey')).toStrictEqual(publickey);

        // @todo: add better test, parse url and check
        expect(typeof loginUrl).toBe('string');
    }, 1000);

    /**
     * this test uses staging threefold api
     * @todo: make mock api to test this easier
     */
    it('should parse and validate the signedAttemptRedirectUrl', async () => {

        /**
         * test case
         * profile data = {
          "profile": {
            "email": {
              "email": "hd@jd.so",
              "sei": null
            }
          },
          "randomRoom": "d1e81e49-602b-4412-94ba-0a90a770a5f1",
          "selectedImageId": 40
        }
         */

        const Data = await login.parseAndValidateRedirectUrl(
            new URL(testRedirectUrl),
            testState
        );

        expect(Data).toStrictEqual({
          "profile": {
            "email": {
              "email": "hd@jd.so",
              "sei": null
            }
          },
          "randomRoom": "d1e81e49-602b-4412-94ba-0a90a770a5f1",
          "selectedImageId": 40
        });
    }, 1000);
});
