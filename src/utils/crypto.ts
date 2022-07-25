import sodium, {crypto_hash, KeyPair} from 'libsodium-wrappers';
import { entropyToMnemonic, mnemonicToEntropy } from '@jimber/simple-bip39';
import { encodeUTF8, decodeBase64, encodeBase64 } from 'tweetnacl-util';

export { generate as generateRandomString } from 'randomstring';

/**
 * @todo: implement crypto_box_SEEDBYTES instead of crypto_box_SEEDBYTES/2 this will also break getEdPkInCurve
 */
export const generateRandomSeedPhrase: () => string = () => {
    const length = sodium.crypto_sign_SEEDBYTES;
    const entropy = sodium.randombytes_buf(length);
    return entropyToMnemonic(entropy);
};

export const decodeHex: (hexString: string) => Uint8Array = hexString => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
};

export const getEdPkInCurve: (publicKey: Uint8Array) => string = publicKey => {
    const signingKey = sodium.crypto_sign_ed25519_pk_to_curve25519(publicKey);
    return encodeBase64(signingKey);
};
export const generateKeyPair: (seedPhrase: string) => KeyPair = (
    seedPhrase: string
) => {
    const entropy = mnemonicToEntropy(seedPhrase);
    // const encodedEntropy = new TextEncoder().encode(entropy);
    const encodedEntropy = Uint8Array.from(decodeHex(entropy));

    return sodium.crypto_sign_seed_keypair(encodedEntropy);
};

export const decrypt: (
    ecryptedMessage: string,
    nonce: string,
    privateKey: Uint8Array,
    pubkey: Uint8Array
) => string = (
    ecryptedMessage: string,
    nonce: string,
    privateKey: Uint8Array,
    pubkey: Uint8Array
) => {
    const newPrivateKey = sodium.crypto_sign_ed25519_sk_to_curve25519(
        privateKey
    );
    const newPubkey = sodium.crypto_sign_ed25519_pk_to_curve25519(pubkey);
    const decryptedData = sodium.crypto_box_open_easy(
        decodeBase64(ecryptedMessage),
        decodeBase64(nonce),
        newPubkey,
        newPrivateKey
    );
    return encodeUTF8(decryptedData);
};

export const hashData: (data: string) => string = (data: string) => {
    return encodeBase64(crypto_hash(data));
};
