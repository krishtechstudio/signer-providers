import { fetchNodeTime } from '@waves/node-api-js/es/api-node/utils';
import { TRANSACTION_TYPE_MAP } from '@waves/node-api-js/es/interface';
import { SignedTx, SignerTx } from '@waves/signer';
import { libs, signTx } from '@waves/waves-transactions';
import { omit } from 'ramda';
import React, { ReactNode } from 'react';
import { IUserWithBalances } from '../interface';
import { CONSTANTS } from '@waves.exchange/provider-ui-components';
import { IState } from '../interface';
import { SignAliasContainer } from '../pages/SignAlias/SignAliasContainer';
import { SignBurnContainer } from '../pages/SignBurn/SignBurnContainer';
import { SignCancelLease } from '../pages/SignCancelLease/SignCancelLeaseContainer';
import { SignDataContainer } from '../pages/SignData/SignDataContainer';
import { SignInvoke } from '../pages/SignInvoke/SignInvokeContainer';
import { SignIssueContainer } from '../pages/SignIssue/SignIssueContainer';
import { SignLease } from '../pages/SignLease/SignLeaseContainer';
import { SignReissueContainer } from '../pages/SignReissue/SignReissueContainer';
import { SignSetAccountScript } from '../pages/SignSetAccountScript/SignSetAccountScriptContainer';
import { SignSetAssetScriptContainer } from '../pages/SignSetAssetScript/SignSetAssetScriptContainer';
import { SignSponsorship } from '../pages/SignSponsorship/SignSponsorshipContainer';
import { SignTransfer } from '../pages/SignTransfer/SignTransferContainer';
// import exchangePage from '../pages/transactions/exchange';
// import leasePage from '../pages/transactions/lease';
// import cancelLeasePage from '../pages/transactions/cancelLease';
// import aliasPage from '../pages/transactions/alias';
// import massTransferPage from '../pages/transactions/massTransfer';
// import setScriptPage from '../pages/transactions/setScript';
// import sponsorshipPage from '../pages/transactions/sponsorship';
// import setAssetScriptPage from '../pages/transactions/setAssetScript';
import { prepareTransactions } from '../services/transactionsService';
import { utils } from '@waves.exchange/provider-ui-components';
import renderPage from '../utils/renderPage';
import batch from './batch';

const { NAME_MAP } = CONSTANTS;

const getPageByType = (type: keyof TRANSACTION_TYPE_MAP): ReactNode => {
    switch (type) {
        case NAME_MAP.transfer:
            return SignTransfer;
        case NAME_MAP.invoke:
            return SignInvoke;
        case NAME_MAP.data:
            return SignDataContainer;
        case NAME_MAP.issue:
            return SignIssueContainer;
        case NAME_MAP.exchange:
            throw new Error('Unsupported type!'); // TODO
        case NAME_MAP.lease:
            return SignLease;
        case NAME_MAP.cancelLease:
            return SignCancelLease;
        case NAME_MAP.alias:
            return SignAliasContainer;
        case NAME_MAP.massTransfer:
            return SignTransfer;
        case NAME_MAP.setScript:
            return SignSetAccountScript;
        case NAME_MAP.sponsorship:
            return SignSponsorship;
        case NAME_MAP.setAssetScript:
            return SignSetAssetScriptContainer;
        case NAME_MAP.burn:
            return SignBurnContainer;
        case NAME_MAP.reissue:
            return SignReissueContainer;
        default:
            throw new Error('Unsupported transaction!');
    }
};

export default function (
    list: Array<SignerTx>,
    state: IState<IUserWithBalances>
): Promise<Array<SignedTx<SignerTx>>> {
    return fetchNodeTime(state.nodeUrl)
        .then((nodeTime) => nodeTime.NTP)
        .catch(() => Date.now())
        .then((time) =>
            prepareTransactions(state, list, time).then((transactions) => {
                if (transactions.length !== 1) {
                    return batch(transactions, state);
                }

                const tx = transactions[0].tx;

                const analyticsParams = {
                    type: Object.keys(NAME_MAP).find(
                        (txType) => NAME_MAP[txType] === tx.type
                    ),
                };

                const [info] = transactions;

                return new Promise<any>((resolve, reject) => {
                    const props = {
                        ...info,
                        networkByte: state.networkByte,
                        user: {
                            ...omit(['privateKey'], state.user),
                            publicKey: libs.crypto.publicKey({
                                privateKey: state.user.privateKey,
                            }),
                        },
                        onConfirm: () => {
                            utils.analytics.send({
                                name: 'Signer_Confirm_Tx_Approve',
                                params: analyticsParams,
                            });

                            resolve(
                                signTx(tx as any, {
                                    privateKey: state.user.privateKey,
                                }) as any
                            );
                        },
                        onCancel: () => {
                            utils.analytics.send({
                                name: 'Signer_Confirm_Tx_Reject',
                                params: analyticsParams,
                            });

                            reject(new Error('User rejection!'));
                        },
                    };

                    renderPage(
                        React.createElement(
                            getPageByType(info.tx.type as any) as any,
                            {
                                key: info.tx.id,
                                ...props,
                            }
                        )
                    );
                });
            })
        );
}
