import { InjectedAccountWithMeta, InjectedExtension } from '@polkadot/extension-inject/types';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';

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

export interface ITransactionDataState {
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult> | null;
  url: string;
}

export enum PAYMENT_STATUS {
  FUTURE = 'FUTURE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}
