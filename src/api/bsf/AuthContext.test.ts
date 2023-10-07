import AuthContext from "./AuthContext";

describe('Auth Functions', () => {
    it('Should properly create a code challenge from a code verify', () => {
        const authContext = new AuthContext({ email: 'email', password: 'password' }, "");
        const codeVerify = 'mDtW3btMJdKc1wyycu8WPwgihzJ5PglhEfYCNmhsdRjLDqrb9H5XUC9Zzg0cqzSNM6_1-0PbtlKOFWz9I59F';
        authContext.rebuildCodeChallenge(codeVerify);
        expect(authContext.codeChallenge).toBe("VMhzFJF5SZtgLIPJufKfyqcWlktBgL0ZiQ0Eevn3VuU");
    });

    it('is testing codes i already have', () => {
        const authContext = new AuthContext({ email: 'email', password: 'password' }, "");
        const codeVerify = 'YZylAOSyA8nUQAOBYNp-0_o-EmAXwc2Ov_KYjDxJ9l0Hc6G8UqtbO1tY';
        authContext.rebuildCodeChallenge(codeVerify);
        expect(authContext.codeChallenge).toBe('cEs4EK_z0lWjODhPreSDpMoomiabtE_gs9uLGI2WRNg');
    });

    it('is testing codes one that seemed to fail already have', () => {
        const authContext = new AuthContext({ email: 'email', password: 'password' }, "");
        const codeVerify = 'XyMhP2mrvks4yXu4DKQvGVOA_mJnkvDisRgo8dlxCmMc2LHAnQoY6tEn8ewUFlDvTQCNnzWbiCV';
        authContext.rebuildCodeChallenge(codeVerify);
        expect(authContext.codeChallenge).toBe('06l9Vf9i3E1Wt_OpYCSF6YMbv9IuAN5WYu_XaTgRtVw');
    });



});