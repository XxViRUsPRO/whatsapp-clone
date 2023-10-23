import "@/styles/globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import Head from "next/head";
import { Provider } from "react-redux";
import store from "@/features/store";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>WhatsApp</title>
        <meta name="description" content="WhatsApp Clone" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
