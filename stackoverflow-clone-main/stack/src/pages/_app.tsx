import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/lib/AuthContext";
import { TranslationProvider } from "@/context/TranslationContext";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Code-Quest</title>
      </Head>
      <AuthProvider>
        <TranslationProvider>
          <ToastContainer />
          <Component {...pageProps} />
        </TranslationProvider>
      </AuthProvider>
    </>
  );
}