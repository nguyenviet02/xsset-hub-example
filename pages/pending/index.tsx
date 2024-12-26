import React, { useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { paymentState, transactionDataState } from '../../lib/recoil/atom';
import { createQR } from 'its-stg-pp';
import SignTransactionButton from '../../components/SignTransactionButton';
import CancelTransactionButton from '../../components/CancelTransactionButton';

type Props = {};

const PendingPage = (props: Props) => {
  const QRRef = React.useRef<HTMLDivElement>(null);
  const paymentData = useRecoilValue(paymentState);
  const transactionData = useRecoilValue(transactionDataState);

  const QRImage = useMemo(() => {
    if (!transactionData.url) return;
    return createQR(transactionData.url);
  }, [transactionData.url]);

  useEffect(() => {
    if (!QRImage) return;
    if (QRRef.current) {
      QRImage.append(QRRef.current);
    }
  }, [QRImage]);

  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener('beforeunload', beforeUnload);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, []);

  return (
    <div className="flex justify-center min-h-screen items-center bg-[#101828] flex-col gap-8">
      <div className='className=" flex flex-col gap-1 items-center'>
        <span className="text-[#eef5f6] font-bold text-[48px]">
          {paymentData.amount} {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
        </span>
        <span className="text-[#eef5f6] font-bold text-[24px]">{paymentData.remark}</span>
      </div>
      <div ref={QRRef}></div>
      <div className="flex flex-col items-center justify-center">
        <span className="text-[#eef5f6] text-[24px] font-bold">Scan this code with your wallet or click below button</span>
        <span className="text-[#eef5f6] text-[16px] font-semibold">You&apos;ll be asked to approve the transaction</span>
      </div>
      <div className="flex gap-4 items-center">
        <SignTransactionButton />
      </div>
    </div>
  );
};

export default PendingPage;
