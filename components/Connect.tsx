import { useEffect, useState } from 'react';
import { web3Accounts, web3AccountsSubscribe, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import clsx from 'clsx';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useRecoilState } from 'recoil';
import { configState } from '../lib/recoil/atom';
import { beatifyAddress } from '../core/beatifyAddress';

type TExtensionState = {
  data?: {
    accounts: InjectedAccountWithMeta[];
    defaultAccount: InjectedAccountWithMeta;
  };
  loading: boolean;
  error: null | Error;
};

const initialExtensionState: TExtensionState = {
  data: undefined,
  loading: false,
  error: null,
};

export const Connect = () => {
  const [extensionState, setExtensionState] = useState(initialExtensionState);
  const [config, setConfig] = useRecoilState(configState);
  console.log('☠️ ~ Connect ~ config:', config);

  const subscribe = async () => {
    await web3AccountsSubscribe((injectedAccounts) => {
      injectedAccounts.map((account) => {
        console.log(account.address);
      });
    });
  };

  const handleConnect = () => {
    setExtensionState({ ...initialExtensionState, loading: true });

    web3Enable('polkadot-extension-dapp-example')
      .then((injectedExtensions) => {
        console.log('☠️ ~ .then ~ injectedExtensions:', injectedExtensions);
        if (!injectedExtensions.length) {
          return Promise.reject(new Error('NO_INJECTED_EXTENSIONS'));
        }

        return web3Accounts();
      })
      .then(async (accounts) => {
        if (!accounts.length) {
          return Promise.reject(new Error('NO_ACCOUNTS'));
        }
        await subscribe();
        const filteredAccounts = accounts.filter((account) => account.type === 'sr25519');
        console.log('☠️ ~ .then ~ filteredAccounts:', filteredAccounts);

        setExtensionState({
          error: null,
          loading: false,
          data: {
            accounts: filteredAccounts,
            defaultAccount: filteredAccounts[0],
          },
        });
        setConfig((prev) => ({ ...prev, selectedAccount: filteredAccounts[0], accounts: filteredAccounts }));
      })
      .catch((error) => {
        console.error('Error with connect', error);
        setExtensionState({ error, loading: false, data: undefined });
      });
  };

  useEffect(() => {
    async function fetchInjector() {
      if (config.selectedAccount) {
        const injector = await web3FromSource(config.selectedAccount.meta.source);
        setConfig((prev) => ({ ...prev, injector }));
      }
    }
    fetchInjector();
  }, [config.selectedAccount, setConfig]);

  if (extensionState.error) {
    return <span className="text-red-500 font-bold tracking-tight">Error with connect: {extensionState.error.message}</span>;
  }

  return config.selectedAccount?.address ? (
    <div className="flex flex-col gap-2 w-full">
      {config.accounts.length > 1 && (
        <div className=" border-b pb-4 border-white w-full">
          <label htmlFor="location" className="block text-[18px] font-bold text-w">
            Select Account
          </label>
          <div className="mt-2 grid grid-cols-1">
            <select
              id="account"
              name="account"
              className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              value={config.selectedAccount?.address}
              onChange={(e) => {
                const selectedAccount = config.accounts.find((account) => account.address === e.target.value);
                if (!selectedAccount) return;
                setConfig((prev) => ({ ...prev, selectedAccount }));
              }}
            >
              {config.accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {beatifyAddress(account.address)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  ) : (
    <button
      disabled={extensionState.loading}
      className="rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 disabled:opacity-50  disabled:cursor-not-allowed"
      onClick={handleConnect}
    >
      {extensionState.loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};
