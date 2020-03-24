import Head from 'next/head';
import '../scss/index.scss';

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
