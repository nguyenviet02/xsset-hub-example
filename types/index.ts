import { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';

export interface IConfigState {
  selectedAccount: InjectedAccountWithMeta | null;
  injector: InjectedExtension | null;
}

export interface IPaymentState {
  reference: string;
  amount: number;
  status: PAYMENT_STATUS;
  errorMessage: string;
}

export enum PAYMENT_STATUS {
  FUTURE = 'FUTURE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
