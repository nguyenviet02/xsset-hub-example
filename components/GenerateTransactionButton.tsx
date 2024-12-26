import { useRouter } from 'next/router';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PAYMENT_STATUS } from '../types';
import { ApiPromise } from '@polkadot/api';
import { useRecoilState } from 'recoil';
import { configState, paymentState, transactionDataState } from '../lib/recoil/atom';
import { toast } from 'react-toastify';

type Props = {
  disabled?: boolean;
  apiInstance?: ApiPromise;
};

const GenerateTransactionButton = ({ disabled, apiInstance }: Props) => {
  const router = useRouter();

  const [paymentData, setPaymentData] = useRecoilState(paymentState);
  const [config, setConfig] = useRecoilState(configState);
  const [transactionData, setTransactionData] = useRecoilState(transactionDataState);

  const recipient = process.env.NEXT_PUBLIC_RECIPIENT;
  const tokenDecimal = process.env.NEXT_PUBLIC_TOKEN_DECIMALS;

  const onClick = async () => {
    const remark = uuidv4();
    setPaymentData((prev) => ({ ...prev, remark, status: PAYMENT_STATUS.PENDING }));
    toast.loading('Generating transaction, you will be redirect to payment page soon');
    const response = await fetch('/api/create-transfer', {
      method: 'POST',
      body: JSON.stringify({
        sender: config?.selectedAccount?.address,
        transferField: {
          recipient,
          amount: paymentData.amount * 10 ** Number(tokenDecimal),
          remark,
        },
      }),
    });
    const data = await response.json();
    const transactionURL = data.transactionURL;
    const transaction = data.transaction;
    setTransactionData({ transaction, url: transactionURL });
    toast.dismiss();
    router.push('/pending');
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="button"
      className="rounded-md bg-white/10 px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-white/20 disabled:opacity-50  disabled:cursor-not-allowed"
    >
      Generate Transaction
    </button>
  );
};

export default GenerateTransactionButton;
