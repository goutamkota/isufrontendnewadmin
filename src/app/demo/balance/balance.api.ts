export class BalanceAPI {
    // private static PROD_BASE_URL = 'https://wallet-topup-new-prod-vn3k2k7q7q-uc.a.run.app/';
    private static PROD_BASE_URL = 'https://wallet-topup-new-prod.iserveu.tech/';
    private static STAGING_BASE_URL = 'https://wallet-topup-staging-new-vn3k2k7q7q-uc.a.run.app/';
    // private static REPORT_PROD_BASE_URL = 'https://walletreportstaging-zwqcqy3qmq-uc.a.run.app/';
    // private static REPORT_PROD_BASE_URL = 'https://walletreport-vn3k2k7q7q-uc.a.run.app/';
    private static REPORT_PROD_BASE_URL = 'https://walletreport.iserveu.tech/';
    private static REPORT_STAGING_BASE_URL = 'https://walletreport-zwqcqy3qmq-uc.a.run.app/';
    // private static PROD_TEST = 'https://wallet-topup-new-prod-vn3k2k7q7q-uc.a.run.app/';
    private static PROD_TEST = 'https://wallet-topup-new-prod.iserveu.tech/';
    public static addBalance = `${BalanceAPI.PROD_BASE_URL}admin/wallet_topup`;
    public static trans = `${BalanceAPI.PROD_BASE_URL}admin/user_wallet_topup`;
    public static transferBalance = `${BalanceAPI.PROD_BASE_URL}admin/user_wallet_topup`;
    public static balanceRequest = `${BalanceAPI.REPORT_PROD_BASE_URL}walletreport`;
    public static updateStatus = `${BalanceAPI.PROD_BASE_URL}users/update_payment_request_status`;
}