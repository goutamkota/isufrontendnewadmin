export class WalletTopUpAPI {
    // private static PROD_BASE_URL = 'https://wallet-topup-new-prod-vn3k2k7q7q-uc.a.run.app/';
    private static PROD_BASE_URL = 'https://wallet-topup-new-prod.iserveu.tech/';
    private static STAGING_BASE_URL = 'https://wallet-topup-staging-new-vn3k2k7q7q-uc.a.run.app/';
    public static fetchBanks = `${WalletTopUpAPI.PROD_BASE_URL}parentBank/retailer_origin_fetch`
    public static addBank = `${WalletTopUpAPI.PROD_BASE_URL}parentBank/retailer_origin_insert`
}