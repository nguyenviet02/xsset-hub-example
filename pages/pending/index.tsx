import React, { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { paymentState, transactionDataState } from '../../lib/recoil/atom';
import { createQR } from 'its-stg-pp';
import CreateTransactionButton from '../../components/SignTransactionButton';

type Props = {};

const PendingPage = (props: Props) => {
  const QRRef = React.useRef<HTMLDivElement>(null);
  const paymentData = useRecoilValue(paymentState);
  const transactionData = useRecoilValue(transactionDataState);

  const QRImage = useMemo(() => {
    return createQR(transactionData.url);
  }, [transactionData.url]);

  useEffect(() => {
    if (QRRef.current) {
      QRImage.append(QRRef.current);
    }
  }, [QRImage]);

  return (
    <div className="flex justify-center min-h-screen items-center bg-[#2a2a2a] flex-col gap-8">
      <span className="text-[#eef5f6] text-[48px] font-bold ">
        {paymentData.amount} {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
      </span>
      <div ref={QRRef}></div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-[#eef5f6] text-[24px] font-bold">Scan this code with your wallet or click below button</span>
        <span className="text-[#eef5f6] text-[16px] font-semibold">You&apos;ll be asked to approve the transaction</span>
      </div>
      <CreateTransactionButton />
    </div>
  );
};

export default PendingPage;
