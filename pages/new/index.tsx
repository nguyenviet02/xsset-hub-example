import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useRecoilState, useRecoilValue } from 'recoil';
import { configState, paymentState } from '../../lib/recoil/atom';
import CreateTransactionButton from '../../components/CreateTransactionButton';
import { getApiInstance } from '../../core/api';
import { ApiPromise } from '@polkadot/api';

type Props = {};

const Connect = dynamic(() => import('../../components/Connect').then((m) => m.Connect), {
  ssr: false,
});

const NewPage = (props: Props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const recipient = searchParams.get('recipient');

  const [paymentData, setPaymentData] = useRecoilState(paymentState);
  const config = useRecoilValue(configState);
  const [apiInstance, setApiInstance] = useState<ApiPromise>();
  const [accountBalance, setAccountBalance] = useState<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData((prev) => ({ ...prev, amount: Number(e.target.value) }));
  };
  useEffect(() => {
    if (!apiInstance || !config.selectedAccount?.address) return;
    const getBalance = async () => {
      const { data: balance } = await apiInstance.query.system.account(config.selectedAccount?.address);
      console.log(process.env.NEXT_PUBLIC_TOKEN_DECIMALS);
      setAccountBalance(Number((balance.free / 10 ** Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS)).toFixed(2)));
    };
    getBalance();
  }, [apiInstance, config.selectedAccount?.address]);

  useEffect(() => {
    async function fetchApi() {
      const api = await getApiInstance();
      setApiInstance(api);
    }
    fetchApi();
  }, [setApiInstance]);
  return (
    <div className="flex justify-center h-screen max-w-screen">
      <div className="flex-1 h-full bg-[#2a2a2a] pt-10 flex justify-center items-center flex-col gap-4">
        <span className="text-white">Enter amount in {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}</span>
        <input
          ref={inputRef}
          onChange={handleInputChange}
          value={Number(paymentData.amount)}
          type="number"
          min={0}
          className="py-3 px-4 block w-full max-w-[400px] border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
        />
      </div>
      <div className="w-[420px] shrink-0 bg-[#222222] pt-10 px-10 flex flex-col gap-4 text-white">
        <div>
          <span>Balance: </span>
          <span>
            {accountBalance} {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
          </span>
        </div>
        <div>
          <span>Total:</span>{' '}
          <span>
            {paymentData.amount} {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
          </span>
        </div>
        <div>
          <Connect />
        </div>
        {config.selectedAccount && <CreateTransactionButton />}
      </div>
    </div>
  );
};

export default NewPage;
