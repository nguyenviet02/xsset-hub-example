import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiPromise } from '@polkadot/api';
import { PAYMENT_STATUS } from '../types';
import { useRecoilState } from 'recoil';
import { configState, paymentState } from '../lib/recoil/atom';
import { getApiInstance } from '../core/api';
import { findReference, Recipient, validateTransfer } from 'its-stg-pp';
import BN from 'bn.js';

type Props = {};

const CreateTransactionButton = () => {
  const [apiInstance, setApiInstance] = useState<ApiPromise>();
  const [paymentData, setPaymentData] = useRecoilState(paymentState);
  const [config, setConfig] = useRecoilState(configState);
  const [hasNewTransaction, setHasNewTransaction] = useState(false);
  const recipient = process.env.NEXT_PUBLIC_RECIPIENT;
  const tokenDecimal = process.env.NEXT_PUBLIC_TOKEN_DECIMALS;

  const makeTransaction = async () => {
    const reference = uuidv4();
    setPaymentData((prev) => ({ ...prev, reference, status: PAYMENT_STATUS.PENDING }));
    const response = await fetch('/api/create-transfer', {
      method: 'POST',
      body: JSON.stringify({
        sender: config?.selectedAccount?.address,
        transferField: {
          recipient,
          amount: paymentData.amount * 10 ** Number(tokenDecimal),
          reference: reference,
        },
      }),
    });
    const data = await response.json();
    console.log('☠️ ~ makeTransaction ~ data:', data);
    const transaction = apiInstance?.tx(data.transaction);
    transaction
      ?.signAndSend(config.selectedAccount!.address, { signer: config.injector?.signer }, async ({ status, txHash }) => {
        if (status.isInBlock) {
          console.log(`Completed at block hash ${status.asInBlock.toString()}`);
          setHasNewTransaction(true);
        } else {
          console.log(`Current status: ${status.type}`);
          console.log('☠️ ~ ?.signAndSend ~ txHash:', txHash.toHuman());
        }
      })
      .catch((error: any) => {
        console.log(':( transaction failed', error);
      });
  };

  useEffect(() => {
    if (!apiInstance || !hasNewTransaction) return;
    const validateTransaction = async () => {
      const findReferenceResponse = await findReference(apiInstance!, paymentData.reference, { retryBlock: 10 });
      if (!findReferenceResponse) {
        console.log('🟥 Cannot found target extrinsic not found');
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
          recipient: process.env.RECIPIENT as Recipient,
          amount: new BN(paymentData.amount * 10 ** Number(tokenDecimal)),
          reference: paymentData.reference,
        });

        // Update payment status
        console.log('✅ Payment validated');
        console.log('📦 Ship order to customer');
        setPaymentData((prev) => ({ ...prev, status: PAYMENT_STATUS.SUCCESS }));
      } catch (error) {
        console.error('❌ Payment failed', error);
        setPaymentData((prev) => ({ ...prev, status: PAYMENT_STATUS.FAILED, errorMessage: error.message }));
      }
    };
    validateTransaction();
  }, [apiInstance, hasNewTransaction, paymentData.amount, paymentData.reference, setPaymentData, tokenDecimal]);

  useEffect(() => {
    async function fetchApi() {
      const api = await getApiInstance();
      setApiInstance(api);
    }
    fetchApi();
  }, [setApiInstance, setConfig]);

  return (
    <button className="border border-black py-3 px-4 rounded disabled:cursor-not-allowed disabled:opacity-80" onClick={makeTransaction}>
      Create Transaction
    </button>
  );
};

export default CreateTransactionButton;
