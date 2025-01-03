import { atom } from 'recoil';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { IConfigState, IPaymentState, ITransactionDataState, PAYMENT_STATUS } from '../../types';

export const configState = atom<IConfigState>({
  key: 'configState',
  default: {
    selectedAccount: null,
    accounts: [],
    injector: null,
  },
});

export const apiState = atom<ApiPromise | null>({
  key: 'apiState',
  default: null,
});

export const paymentState = atom<IPaymentState>({
  key: 'paymentState',
  default: {
    recipient: '',
    remark: `ORDER-${Math.floor(Math.random() * 1000000)}`,
    amount: 0,
    status: PAYMENT_STATUS.FUTURE,
    errorMessage: '',
  },
});

export const transactionDataState = atom<ITransactionDataState>({
  key: 'transactionDataState',
  default: {
    transaction: null,
    url: '',
  },
});
