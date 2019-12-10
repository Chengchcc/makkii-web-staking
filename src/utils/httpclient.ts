import { APPSERVER_URL_PRODUCTION, APPSERVER_URL_TEST } from "./constants.json";

const axios = require("axios").default;

declare const NETWORK: string;
const base_url =
    NETWORK === "amity" ? APPSERVER_URL_TEST : APPSERVER_URL_PRODUCTION;

const httpclient = axios.create({
    baseURL: base_url
});

const send_event_log = async eventLog => {
    console.log("sending event log: ", eventLog);
    httpclient
        .put("/eventlog", eventLog)
        .then(response => {
            console.log("send event log response: ", response);
        })
        .catch(error => {
            console.log("send event log error: ", error);
        });
};

export { send_event_log };
