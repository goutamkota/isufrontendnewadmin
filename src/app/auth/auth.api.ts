export class AuthApi {
    public static url = {
        // login: 'https://wallet.iserveu.online/UPITEST/getlogintoken.json',
        // dashboard: 'https://wallet.iserveu.online/UPITEST/user/dashboard.json',
        // wallet2: 'https://wallet.iserveu.online/UPITEST/wallet2/getuserbalance',
        // wallet1: 'https://wallet.iserveu.online/UPITEST/getuserbalance.json'
        login: 'https://itpl.iserveu.tech/getlogintoken.json',
        dashboard: 'https://itpl.iserveu.tech/user/dashboard.json',
        wallet2: 'https://itpl.iserveu.tech/user/wallet2/getuserbalance', // LIVE API
        // wallet2: 'https://uatapps.iserveu.online/core_bs/user/wallet2/getuserbalance', // Staging API
        wallet1: 'https://itpl.iserveu.tech/user/getuserbalance.json',
        refreshToken: 'https://itpl.iserveu.tech/logintokenrefresh.json'
    };
}