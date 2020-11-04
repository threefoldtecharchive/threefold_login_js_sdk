import {
    generateRandomString,
    getEdPkInCurve,
    generateKeyPair,
} from './utils/crypto';
import sodium, { KeyPair } from 'libsodium-wrappers';

export class ThreefoldLogin {
    private readonly _appId: string;
    private readonly _seedPhrase: string;
    private readonly _redirectUrl: string;

    constructor(appId: string, seedPhrase: string, redirectUrl: string) {
        this._appId = appId;
        this._seedPhrase = seedPhrase;
        this._redirectUrl = redirectUrl;
    }

    public get appId(): string {
        return this._appId;
    }

    public get seedPhrase(): string {
        return this._seedPhrase;
    }

    public get redirectUrl(): string {
        return this._redirectUrl;
    }

    public async init(): Promise<void> {
        await sodium.ready;
    }

    async generateLoginUrl(): Promise<string> {
        const state = generateRandomString();
        const botFrontEnd = 'test';
        const keys: KeyPair = await generateKeyPair(this._seedPhrase);
        const edPkInCurve = getEdPkInCurve(keys.publicKey);
        console.log(edPkInCurve);
        return `${botFrontEnd}?state=${state}&appid=${
            this._appId
        }&publickey=${encodeURIComponent(
            edPkInCurve
        )}&redirecturl=${encodeURIComponent(this._redirectUrl)}`;
    }
}
