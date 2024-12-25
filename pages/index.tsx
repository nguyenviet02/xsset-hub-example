import Head from 'next/head';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const createNewTransaction = () => {
    router.push({
      pathname: '/new',
    });
  };
  return (
    <>
      <Head>
        <title>Xsset</title>
      </Head>
      <main>
        <div className="px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">Create New Transaction</h1>
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  <button onClick={createNewTransaction} className="border border-black py-3 px-4 rounded">
                    Create New
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
