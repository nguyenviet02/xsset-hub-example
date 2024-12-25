import { useEffect, useState } from 'react';
import { web3Accounts, web3AccountsSubscribe, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import clsx from 'clsx';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { useRecoilState } from 'recoil';
import { configState } from '../lib/recoil/atom';

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

        setExtensionState({
          error: null,
          loading: false,
          data: {
            accounts: accounts,
            defaultAccount: accounts[0],
          },
        });
        setConfig((prev) => ({ ...prev, selectedAccount: accounts[0] }));
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

  return extensionState.data ? (
    <div className="flex flex-col gap-2">
      <p>Hello, {beatifyAddress(extensionState.data.defaultAccount.address)}!</p>
    </div>
  ) : (
    <button
      disabled={extensionState.loading}
      className={clsx(
        'inline-block rounded-lg px-4 py-1.5',
        'text-base font-semibold leading-7 text-white shadow-sm ring-1 ring-amber-600',
        extensionState.loading ? 'cursor-not-allowed bg-amber-400' : 'bg-amber-500 hover:bg-amber-600 hover:ring-amber-600'
      )}
      onClick={handleConnect}
    >
      {extensionState.loading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

function beatifyAddress(address: string) {
  return `${address.slice(0, 3)}...${address.slice(-3)}`;
}
