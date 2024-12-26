import { useRouter } from 'next/router';
import React from 'react';

type Props = {};

const CancelTransactionButton = (props: Props) => {
  const router = useRouter();
  return (
    <button
      type="button"
      className="rounded-md  px-4 py-3 text-[16px] font-semibold text-white shadow-sm hover:underline disabled:cursor-not-allowed disabled:opacity-80"
      onClick={() => {
        router.back();
      }}
    >
      Cancel Transaction
    </button>
  );
};

export default CancelTransactionButton;
