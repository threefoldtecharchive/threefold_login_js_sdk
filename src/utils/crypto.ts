import sodium, { KeyPair } from 'libsodium-wrappers';
import { entropyToMnemonic, mnemonicToEntropy } from 'bip39';
import { encodeBase64 } from 'tweetnacl-util';

/**
 * @todo: implement crypto_box_SEEDBYTES instead of crypto_box_SEEDBYTES/2 this will also break getEdPkInCurve
 */
export const generateRandomSeedPhrase: () => string = () => {
    const length = sodium.crypto_box_SEEDBYTES / 2;
    const entropy = sodium.randombytes_buf(length);
    return entropyToMnemonic(entropy as Buffer);
};

export const generateRandomString: () => string = () => {
    return 'test';
};

export const getEdPkInCurve: (publicKey: Uint8Array) => string = publicKey => {
    const signingKey = sodium.crypto_sign_ed25519_pk_to_curve25519(publicKey);
    return encodeBase64(signingKey);
};
export const generateKeyPair: (seedPhrase: string) => KeyPair = (
    seedPhrase: string
) => {
    const entropy = mnemonicToEntropy(seedPhrase);
    const encodedEntropy = new TextEncoder().encode(entropy);

    return sodium.crypto_sign_seed_keypair(encodedEntropy);
};
