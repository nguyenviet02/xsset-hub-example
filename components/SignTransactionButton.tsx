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

  const signTransaction = async (transaction: SubmittableExtrinsic<'promise', ISubmittableResult>) => {
    const transactionUnsigned = apiInstance?.tx(transaction);
    transactionUnsigned
      ?.signAndSend(config.selectedAccount!.address, { signer: config.injector?.signer }, async ({ status, txHash }) => {
        if (status.isInBlock) {
          console.log(`Completed at block hash ${status.asInBlock.toString()}`);
          setHasNewTransaction(true);
          toast.loading('Validating transaction, please wait...');
        } else {
          console.log();
          toast.info(`Current status: ${status.type}`);
        }
      })
      .catch((error: any) => {
        console.log(':( transaction failed', error);
      });
  };

  useEffect(() => {
    if (!apiInstance || !hasNewTransaction) return;
    const recipient = process.env.NEXT_PUBLIC_RECIPIENT;
    const tokenDecimal = process.env.NEXT_PUBLIC_TOKEN_DECIMALS;
    const validateTransaction = async () => {
      const findReferenceResponse = await findReference(apiInstance!, paymentData.reference, { retryBlock: 10 });
      if (!findReferenceResponse) {
        console.log('🟥 Cannot found target extrinsic not found');
        toast.error('Cannot found target extrinsic not found');
        return;
      }
      const { blockHash, extrinsicHash } = findReferenceResponse;
      console.log('Founded Reference:', {
        blockHash: blockHash.toHex(),
        extrinsicHash: extrinsicHash.toHex(),
      });
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
        setPaymentData((prev) => ({ ...prev, status: PAYMENT_STATUS.SUCCESS }));
      } catch (error) {
        console.error('❌ Payment failed', error);
        toast.dismiss();
				toast.error('Payment failed');
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
    <button type="button" className="rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20" onClick={() => signTransaction(transactionData.transaction!)}>
      Sign Transaction
    </button>
  );
};

export default CreateTransactionButton;
