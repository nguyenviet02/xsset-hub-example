import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@polkadot/api-augment';
import '@polkadot/rpc-augment';
import '@polkadot/types-augment';
import { RecoilRoot } from 'recoil';
import { Bounce, ToastContainer } from 'react-toastify';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
    </RecoilRoot>
  );
}
