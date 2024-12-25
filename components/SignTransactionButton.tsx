import React, { useEffect, useState } from 'react';
import { ApiPromise } from '@polkadot/api';
import { PAYMENT_STATUS } from '../types';
import { useRecoilState, useRecoilValue } from 'recoil';
import { configState, paymentState, transactionDataState } from '../lib/recoil/atom';
import { getApiInstance } from '../core/api';
import { findReference, Recipient, validateTransfer } from 'its-stg-pp';
import BN from 'bn.js';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { toast } from 'react-toastify';

type Props = {};

const CreateTransactionButton = () => {
  const [apiInstance, setApiInstance] = useState<ApiPromise>();
  const [paymentData, setPaymentData] = useRecoilState(paymentState);
  const [config, setConfig] = useRecoilState(configState);
  const [hasNewTransaction, setHasNewTransaction] = useState(false);
  const transactionData = useRecoilValue(transactionDataState);
  const [isSigning, setIsSigning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [hashData, setHashData] = useState<any>({
    blockHash: '',
    extrinsicHash: '',
  });

  const signTransaction = async (transaction: SubmittableExtrinsic<'promise', ISubmittableResult>) => {
    if (!apiInstance) return;
    setIsSigning(true);
    const transactionUnsigned = apiInstance?.tx(transaction);
    transactionUnsigned
      ?.signAndSend(config.selectedAccount!.address, { signer: config.injector?.signer }, async ({ status }) => {
        setHasNewTransaction(true);
        if (status.isInBlock) {
          setIsSigning(false);
          console.log(`Completed at block hash ${status.asInBlock.toString()}`);
        } else {
          toast.info(`Current status: ${status.type}`);
        }
      })
      .catch((error: any) => {
        console.log(':( transaction failed', error);
        setIsSigning(false);
      });
  };

  useEffect(() => {
    if (!apiInstance || !hasNewTransaction) return;
    const recipient = process.env.NEXT_PUBLIC_RECIPIENT;
    const tokenDecimal = process.env.NEXT_PUBLIC_TOKEN_DECIMALS;
    const validateTransaction = async () => {
      setIsValidating(true);
      toast.loading('Validating transaction, please wait...');
      const findReferenceResponse = await findReference(apiInstance!, paymentData.reference, { retryBlock: 10 });
      if (!findReferenceResponse) {
        console.log('🟥 Cannot found target extrinsic not found');
        toast.error('Cannot found target extrinsic not found');
        setIsValidating(false);
        return;
      }
      const { blockHash, extrinsicHash } = findReferenceResponse;
      console.log('Founded Reference:', {
        blockHash: blockHash.toHex(),
        extrinsicHash: extrinsicHash.toHex(),
      });
      setHashData({ blockHash: blockHash.toHex(), extrinsicHash: extrinsicHash.toHex() });

      console.log(`✅ Westend Subscan:`);
      console.log(`Block: https://westend.subscan.io/extrinsic/${blockHash.toHex()}`);
      console.log(`Extrinsic: https://westend.subscan.io/extrinsic/${extrinsicHash.toHex()}`);

      try {
        await validateTransfer(apiInstance!, blockHash, extrinsicHash, {
          recipient: recipient as Recipient,
          amount: new BN(paymentData.amount * 10 ** Number(tokenDecimal)),
          reference: paymentData.reference,
        });
        toast.dismiss();
        // Update payment status
        toast.success('Payment validated');
        console.log('✅ Payment validated');
        console.log('📦 Ship order to customer');
        setIsValidating(false);
        setPaymentData((prev) => ({ ...prev, status: PAYMENT_STATUS.SUCCESS }));
      } catch (error) {
        console.error('❌ Payment failed', error);
        toast.dismiss();
        toast.error('Payment failed');
        setIsValidating(false);
        setPaymentData((prev) => ({ ...prev, status: PAYMENT_STATUS.FAILED, errorMessage: error.message }));
      }
    };
    validateTransaction();
  }, [apiInstance, hasNewTransaction, paymentData.amount, paymentData.reference, setPaymentData]);

  useEffect(() => {
    async function fetchApi() {
      const api = await getApiInstance();
      setApiInstance(api);
    }
    fetchApi();
  }, [setApiInstance, setConfig]);

  return (
    <div>
      {isValidating && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md">
            <span>Validating transaction, please wait...</span>
          </div>
        </div>
      )}
      {hashData.blockHash || hashData.extrinsicHash ? (
        <div className="bg-white p-4 rounded-md flex flex-col gap-2">
          <span>
            Block Hash:{' '}
            <a className="underline" href={`https://westend.subscan.io/extrinsic/${hashData.blockHash}`}>
              {hashData.blockHash}
            </a>
          </span>
          <span>
            Extrinsic Hash:{' '}
            <a className="underline" href={`https://westend.subscan.io/extrinsic/${hashData.extrinsicHash}`}>
              {hashData.extrinsicHash}
            </a>
          </span>
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <button
            type="button"
            className="rounded-md  px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:underline disabled:cursor-not-allowed disabled:opacity-80"
            onClick={() => signTransaction(transactionData.transaction!)}
          >
            Cancel Transaction
          </button>
          <button
            disabled={isSigning || isValidating}
            type="button"
            className="rounded-md bg-white/10 px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-80"
            onClick={() => signTransaction(transactionData.transaction!)}
          >
            Sign Transaction
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTransactionButton;
