import { AppProps } from "next/app";
import Axios from "axios";
import { Fragment } from "react";

import "../styles/tailwind.css";
import Navbar from "../components/navbar";

Axios.defaults.baseURL = "http://localhost:5000/api";
Axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Navbar />
      <Component {...pageProps} />
    </Fragment>
  );
}

export default App;
