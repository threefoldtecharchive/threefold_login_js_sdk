export const parseSignedAttemptFromUrl: (
    url: URL
) => { doubleName: string; signedAttempt: string } = (url: URL) => {
    if (!url.searchParams.has('signedAttempt')) {
        throw new Error('no signedAttemptParameter');
    }

    const signedAttemptObject = JSON.parse(
        url.searchParams.get('signedAttempt') as string
    );

    return {
        signedAttempt: signedAttemptObject.signedAttempt,
        doubleName: signedAttemptObject.doubleName,
    };
};
