import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRecoilState, useRecoilValue } from 'recoil';
import { configState, paymentState } from '../../lib/recoil/atom';
import { getApiInstance } from '../../core/api';
import { ApiPromise } from '@polkadot/api';
import GenerateTransactionButton from '../../components/GenerateTransactionButton';
import { beatifyAddress } from '../../core/beatifyAddress';
import Image from 'next/image';
import { toast } from 'react-toastify';

type Props = {};

const Connect = dynamic(() => import('../../components/Connect').then((m) => m.Connect), {
  ssr: false,
});

const NewPage = (props: Props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [paymentData, setPaymentData] = useRecoilState(paymentState);
  const config = useRecoilValue(configState);
  const [apiInstance, setApiInstance] = useState<ApiPromise>();
  const [accountBalance, setAccountBalance] = useState<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData((prev) => ({ ...prev, amount: Number(e.target.value.toString()) }));
  };

  const recipient = process.env.NEXT_PUBLIC_RECIPIENT || '';
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
    <div className="flex justify-center items-center h-screen max-w-screen bg-[#101828]">
      <div className="min-h-fit flex flex-col justify-center items-center bg-[#141d31] p-10 rounded-lg gap-8 border border-[#1e293b]">
        <div className="flex flex-col gap-4 items-center text-white w-full ">
          <div className="w-full">
            <Connect />
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-[375px] w-full  h-full">
          <div className="w-full flex justify-between items-center">
            <span className="text-white font-bold">Recipient</span>
          </div>
          <div className="flex items-center rounded-md bg-white/10 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20">
            <input
              value={beatifyAddress(recipient, 10)}
              type="text"
              disabled
              className="py-3 px-4 block w-full bg-transparent border-none outline-none rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:pointer-events-none dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            />
            <button>
              <Image
                src="/copy.svg"
                alt="copy"
                width={24}
                height={24}
                onClick={() => {
                  navigator.clipboard.writeText(recipient);
                  toast.success('Recipient copied to clipboard', {
                    autoClose: 2000,
                  });
                }}
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-[375px] w-full  h-full">
          <div className="w-full flex  items-center gap-1 text-white font-bold">
            <span>Remark</span>
            <a className="underline text-[14px]" href="https://www.base64encode.org/">
              (Encode with base64 format)
            </a>
          </div>
          <div className="flex items-center rounded-md bg-white/10 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20">
            <input
              value={paymentData.remark}
              type="text"
              disabled
              className="py-3 px-4 block w-full bg-transparent border-none outline-none rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 disabled:pointer-events-none dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            />
            <button>
              <Image
                src="/copy.svg"
                alt="copy"
                width={24}
                height={24}
                onClick={() => {
                  navigator.clipboard.writeText(paymentData.remark);
                  toast.success('Remark copied to clipboard', {
                    autoClose: 2000,
                  });
                }}
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4 min-w-[375px] w-full  h-full">
          <div className="w-full flex justify-between items-center">
            <span className="text-white font-bold">Amount</span>
            <div className="w-fit text-white font-bold">
              <span>Balance: </span>
              <span>
                {accountBalance} {process.env.NEXT_PUBLIC_TOKEN_SYMBOL}
              </span>
            </div>
          </div>
          <input
            ref={inputRef}
            onChange={handleInputChange}
            value={paymentData.amount.toString()}
            type="number"
						step="any"
            min={0}
            className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          />
        </div>
        {config.selectedAccount && <GenerateTransactionButton apiInstance={apiInstance} disabled={paymentData.amount === 0} />}
      </div>
    </div>
  );
};

export default NewPage;
