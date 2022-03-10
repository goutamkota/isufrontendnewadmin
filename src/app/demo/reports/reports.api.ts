export class ReportsApi {
    public static url = {
        secureUrl: 'https://itpl.iserveu.tech/BQ/transactiondetails',
        recharge: {
            recharge1: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            recharge2: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/new_node_bigquery_report/all_transaction_report',
        },
        dmt: {
            all_succ_trans: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            refund_trans: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/new_node_bigquery_report/refund_transaction_report',
        },

        recharge2: {
            //   all_trans: 'https://unifiedalltransactionreportupistaging.iserveu.website/unified_all_transaction_report', //stagging
            //    all_trans:'https://unified-all-txn-report-prod-vn3k2k7q7q-uc.a.run.app/unified_all_transaction_report' //live
            all_trans: 'https://unified-all-txn-report-prod.iserveu.tech/unified_all_transaction_report' //live
            //  all_trans:'https://unifiedalltxnreportstaging-zwqcqy3qmq-uc.a.run.app/unified_all_transaction_report'
        },
        dmt2: {
            // all_trans: 'https://dmtreportchangeresponse-vn3k2k7q7q-uc.a.run.app/dmt_report',
            all_trans: 'https://dmtreportchangeresponse.iserveu.tech/dmt_report',

            // gateway_trans:'https://dmtnew-report-v2-prod-vn3k2k7q7q-uc.a.run.app/newdmt_v2',
            // gateway_trans:'https://dmtnew-report-v2.iserveu.tech/newdmt_v2',
            gateway_trans: 'https://dmtnew-report-v2.iserveu.tech/newdmt_v2',
            // gateway_trans1:'https://dmtnew-report-v3-staging-zwqcqy3qmq-uc.a.run.app/newdmt_v3', //stage
            // gateway_trans1:'https://dmtnew-report-v3-prod-vn3k2k7q7q-uc.a.run.app/newdmt_v3', //live
            gateway_trans1: 'https://dmtnew-report-v3.iserveu.tech/newdmt_v3', //live
            // all_trans: 'https://dmtreportchangeresponse-zwqcqy3qmq-uc.a.run.app/dmt_report',//stage
            // gateway_trans:'https://dmtnew-report-v2-prod-zwqcqy3qmq-uc.a.run.app/newdmt_v2',//stage
        },
        matm: {
            matm1: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            matm2: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/report_matm_2',
        },
        aeps: {
            aeps1: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            aeps2: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/new_node_bigquery_report/all_transaction_report',
        },
        bbps: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/new_node_bigquery_report/all_transaction_report',
        insurance: 'https://itpl.iserveu.tech/BQ/transactiondetails',

        upi: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/new_node_bigquery_report/all_transaction_report',

        commission: {
            comm1: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            comm2: 'https://us-central1-creditapp-29bf2.cloudfunctions.net/commission2_bigquery_report',
            // new_comm: 'https://newdmtreport-vn3k2k7q7q-uc.a.run.app/dmt_report'
            new_comm: 'https://newdmtreport.iserveu.tech/dmt_report'
        },
        pos: {
            txn_report: 'https://unifiedalltxnreportstaging-zwqcqy3qmq-uc.a.run.app/unified_all_transaction_report'
        },

        cashout: {
            aeps_matm: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            // wallet: 'https://wallet2-cashout-prod-vn3k2k7q7q-uc.a.run.app/report'
            wallet: 'https://wallet2-cashout-prod.iserveu.tech/report'
        },
        wallet: {
            // my_wallet1: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            oldUserWallet: 'https://itpl.iserveu.tech/BQ/transactiondetails',
            userNames: 'https://itpl.iserveu.tech/getchildren/.json',
            //    my_wallet1: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report',//live
            my_wallet1: 'https://newdmt-reportv2.iserveu.tech/dmt_report',//live
            //    my_wallet1: 'https://newdmtreportstatingtest-zwqcqy3qmq-uc.a.run.app/dmt_report',//live
            //   my_wallet1: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report',//staging
            //  my_wallet1: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report', //new live
            //    my_wallet2: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report', //staging
            //    my_wallet2: 'https://newdmt-reportv2.iserveu.tech/dmt_report', //staging
            my_wallet2: 'https://newdmt-reportv2.iserveu.tech/dmt_report', // live
            //   my_wallet2: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report', //new live
            //   wallet_intrchng: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report', //staging
            wallet_intrchng: 'https://newdmt-reportv2.iserveu.tech/dmt_report', //staging
            //  wallet_intrchng: 'https://newdmtreportv2-vn3k2k7q7q-uc.a.run.app/dmt_report', //new live
            userwallet: 'https://itpl.iserveu.tech/BQ/transactiondetails'
        },
        
        shopName: 'https://itpl.iserveu.tech/usershopinfo.json',
        // shopName2: 'https://wallet.iserveu.online/CORESTAGING/user/user_details', //staging
        shopName2: 'https://itpl.iserveu.tech/user/user_details',
        pdfurl: 'https://dmtemailreport.iserveu.tech/email_report',
    }

}