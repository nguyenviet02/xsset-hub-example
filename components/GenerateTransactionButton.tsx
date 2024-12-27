import { useRouter } from 'next/router';
import React from 'react';
import { ApiPromise } from '@polkadot/api';
import { useRecoilState, useRecoilValue } from 'recoil';
import { configState, paymentState, transactionDataState } from '../lib/recoil/atom';
import { toast } from 'react-toastify';

type Props = {
  disabled?: boolean;
  apiInstance?: ApiPromise;
};

const GenerateTransactionButton = ({ disabled, apiInstance }: Props) => {
  const router = useRouter();

  const paymentData = useRecoilValue(paymentState);
  const config = useRecoilValue(configState);
  const [transactionData, setTransactionData] = useRecoilState(transactionDataState);

  const tokenDecimal = process.env.NEXT_PUBLIC_TOKEN_DECIMALS;

  const onClick = async () => {
    toast.loading('Generating transaction, you will be redirect to payment page soon');
    try {
      const response = await fetch('/api/create-transfer', {
        method: 'POST',
        body: JSON.stringify({
          sender: config?.selectedAccount?.address,
          transferField: {
            recipient: paymentData.recipient,
            amount: paymentData.amount * 10 ** Number(tokenDecimal),
            remark: paymentData.remark,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.dismiss();
        throw new Error(data.message);
      }
      const transactionURL = data.transactionURL;
      const transaction = data.transaction;
      setTransactionData({ transaction, url: transactionURL });
      toast.dismiss();
      router.push('/pending');
    } catch (error) {
      toast.error(error.message);
    }
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
