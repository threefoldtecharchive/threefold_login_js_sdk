import { ThreefoldLogin } from '../../src/index';
import {
    generateKeyPair,
    generateRandomSeedPhrase,
    getEdPkInCurve,
} from '../../src/utils/crypto';
import sodium, { KeyPair } from 'libsodium-wrappers';

const appId = 'test.threefoldlogin';
const seedPhrase =
    'adjust cabin jacket brick merge please inflict charge among genius boost vibrant';
const redirectUrl = 'test';

let login: ThreefoldLogin;
describe('Crypto', () => {
    beforeAll(async callback => {
        await sodium.ready;
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

describe('ThreefoldLogin', () => {
    beforeEach(async () => {
        login = new ThreefoldLogin(appId, seedPhrase, redirectUrl);
        await login.init();
    }, 1000);
    it('should be able to be constructed', () => {
        const login = new ThreefoldLogin(appId, seedPhrase, redirectUrl);
        expect(login).toBeInstanceOf(ThreefoldLogin);
    });

    it('should contain appId', () => {
        expect(login.appId).toBe(appId);
    });

    it('should return login url', async () => {
        const loginUrl = await login.generateLoginUrl();
        // @todo: add better test, parse url and check
        expect(typeof loginUrl).toBe('string');
    }, 1000);
});
