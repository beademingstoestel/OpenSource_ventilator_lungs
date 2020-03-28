import 'regenerator-runtime/runtime';
import Head from 'next/head';
import '../scss/index.scss';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

toast.configure();

const CustomApp = ({ Component, pageProps }) => {
    return (
        <>
            <Head>
                <link href="https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap" rel="stylesheet" />
            </Head>
            <Component {...pageProps} />
        </>
    );
};

export default CustomApp;
