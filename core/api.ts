import { ApiPromise, WsProvider } from '@polkadot/api';

const wsProvider = new WsProvider("wss://westend-rpc.polkadot.io");
let apiInstance: ApiPromise;

export const getApiInstance = async (): Promise<ApiPromise> => {
  if (!apiInstance) {
    console.log('Creating API');
    apiInstance = await ApiPromise.create({ provider: wsProvider });
  }
  console.log('API Existed');
  return apiInstance;
};
