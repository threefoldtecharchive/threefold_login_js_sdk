import sodium, { KeyPair } from 'libsodium-wrappers';
import { decrypt, generateKeyPair, getEdPkInCurve } from './utils/crypto';
import { parseSignedAttemptFromUrl } from './utils/parse';
import { encodeUTF8, decodeBase64 } from 'tweetnacl-util';
import Axios from 'axios';

export class ThreefoldLogin {
    private readonly _threeFoldAPIHost: string;
    private readonly _appId: string;
    private readonly _seedPhrase: string;
    private readonly _redirectUrl: string;

    constructor(
        threeFoldAPIHost: string,
        appId: string,
        seedPhrase: string,
        redirectUrl: string
    ) {
        this._threeFoldAPIHost = threeFoldAPIHost;
        this._appId = appId;
        this._seedPhrase = seedPhrase;
        this._redirectUrl = redirectUrl;
    }

    public get threeFoldAPIHost(): string {
        return this._threeFoldAPIHost;
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

    async generateLoginUrl(
        state: string,
        extraParams: {
            [key: string]: string;
        } = {}
    ): Promise<string> {
        const keyPair: KeyPair = await generateKeyPair(this._seedPhrase);
        const publickey = getEdPkInCurve(keyPair.publicKey);

        const url = new URL(this._threeFoldAPIHost);

        const params = {
            state: state,
            appid: this._appId,
            publickey: publickey,
            redirecturl: this._redirectUrl,
            ...extraParams,
        };
        for (const paramsKey in params) {
            url.searchParams.append(paramsKey, params[paramsKey]);
        }

        return url.toString();
    }

    async parseAndValidateRedirectUrl(
        url: URL,
        state: string
    ): Promise<{
        selectedImageId: number;
        randomRoom: string;
        profile: Record<string, unknown>;
    }> {
        await sodium.ready;

        const { signedAttempt, doubleName } = parseSignedAttemptFromUrl(url);
        const decodedSignedAttempt = decodeBase64(signedAttempt);

        const userPublicKey: Uint8Array = await this.getPublicKeyForDoubleName(
            doubleName
        );

        const signResult = sodium.crypto_sign_open(
            decodedSignedAttempt,
            userPublicKey
        );

        const signResultObject = JSON.parse(encodeUTF8(signResult));

        if (signResultObject.signedState !== state) {
            throw Error('state could not be matched');
        }

        if (signResultObject.doubleName !== doubleName) {
            throw Error('The name cannot be matched.');
        }

        if (signResultObject.appId !== this._appId) {
            throw Error('The appId cannot be matched.');
        }

        // consider signResultObject as verified

        const encryptedData = signResultObject['data'];

        const keyPair = generateKeyPair(this._seedPhrase);
        const profileData = decrypt(
            encryptedData.ciphertext,
            encryptedData.nonce,
            keyPair.privateKey,
            userPublicKey
        );

        return {
            selectedImageId: signResultObject.selectedImageId,
            randomRoom: signResultObject.randomRoom,
            profile: JSON.parse(profileData),
        };
    }

    private async getPublicKeyForDoubleName(
        doubleName: string
    ): Promise<Uint8Array> {
        const userData = await Axios.get(
            `${this._threeFoldAPIHost}/api/users/${doubleName}`
        );
        if (!userData?.data?.publicKey) {
            throw Error('no publicKey');
        }

        return decodeBase64(userData.data.publicKey);
    }
}
