import sodium, {KeyPair} from 'libsodium-wrappers';
import {decrypt, generateKeyPair, getEdPkInCurve} from './utils/crypto';
import {parseSignedAttemptFromUrl} from './utils/parse';
import {encodeUTF8, decodeBase64} from 'tweetnacl-util';
import Axios from 'axios';

export class ThreefoldLogin {
  private readonly _threeFoldApiUrl: string;
  private readonly _appId: string;
  private readonly _seedPhrase: string;
  private readonly _redirectUrl: string;
  private readonly _kycBackendApiUrl: string;

  constructor(
    threeFoldApiUrl: string,
    appId: string,
    seedPhrase: string,
    redirectUrl: string,
    kycBackendApiUrl: string
  ) {
    this._threeFoldApiUrl = threeFoldApiUrl;
    this._appId = appId;
    this._seedPhrase = seedPhrase;
    this._redirectUrl = redirectUrl;
    this._kycBackendApiUrl = kycBackendApiUrl;
  }

  public get threeFoldAPIHost(): string {
    return this._threeFoldApiUrl;
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

  public get kycBackendApiUrl(): string {
    return this._kycBackendApiUrl;
  }

  public async init(): Promise<void> {
    await sodium.ready;
  }

  generateLoginUrl(
    state: string,
    extraParams: Record<string, string> = {}
  ): string {
    const keyPair: KeyPair = generateKeyPair(this._seedPhrase);
    const publickey = getEdPkInCurve(keyPair.publicKey);

    const url = new URL(this._threeFoldApiUrl);

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

    const {signedAttempt, doubleName} = parseSignedAttemptFromUrl(url);
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
      profile: {doubleName, ...JSON.parse(profileData)},
    };
  }

  private async getPublicKeyForDoubleName(
    doubleName: string
  ): Promise<Uint8Array> {
    const userData = await Axios.get(
      `${this._threeFoldApiUrl}/api/users/${doubleName}`
    );
    if (!userData?.data?.publicKey) {
      throw Error('no publicKey');
    }

    return decodeBase64(userData.data.publicKey);
  }

  async verifySignedEmailIdenfier(
    signedEmailIdentifier: string
  ): Promise<{ email: string; identifier: string }> {
    const sei = await Axios.post(
      `${this._kycBackendApiUrl}/verification/verify-sei`,
      {signedEmailIdentifier: signedEmailIdentifier}
    );

    if (sei.status !== 200) {
      throw Error('No valid response');
    }

    return sei.data;
  }

  async verifySignedPhoneIdenfier(
    signedPhoneIdentifier: string
  ): Promise<{ email: string; identifier: string }> {
    const sei = await Axios.post(
      `${this._kycBackendApiUrl}/verification/verify-spi`,
      {signedPhoneIdentifier: signedPhoneIdentifier}
    );

    if (sei.status !== 200) {
      throw Error('No valid response');
    }

    return sei.data;
  }

  async verifySignedIdentityIdentifier(
    identifier: string,
    signedIdentifier: string,
  ): Promise<any> {

    const isIdentified = await Axios.post(`${this._kycBackendApiUrl}
    /verification/verify-identity-identifier?identifier=${identifier}`, {
      identifier: signedIdentifier,
    })

    if (isIdentified.status !== 200) {
      throw Error('No valid response');
    }

    return isIdentified.data;
  }


  async isEmailVerified(signedEmailIdentifier: string): Promise<boolean> {
    try {
      const emailData = await this.verifySignedEmailIdenfier(
        signedEmailIdentifier
      );

      return !!emailData;
    } catch (e) {
      return false;
    }
  }

  async isPhoneVerified(signedPhoneIdentifier: string): Promise<boolean> {
    try {
      const phoneData = await this.verifySignedPhoneIdenfier(
        signedPhoneIdentifier
      );

      return !!phoneData;
    } catch (e) {
      return false;
    }
  }
}
