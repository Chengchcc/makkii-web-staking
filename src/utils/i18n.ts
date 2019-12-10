import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import XHR from "i18next-xhr-backend";
import en from "../locale/en.json";
import zh from "../locale/zh.json";

i18n.use(XHR)
    .use(LanguageDetector)
    .init(
        {
            resources: {
                en: {
                    translations: en
                },
                zh: {
                    translations: zh
                }
            },
            // have a common namespace used around the full app
            ns: ["translations"],
            defaultNS: "translations",
            lng: "en",
            fallbackLng: "en",
            debug: false,
            react: {
                wait: true
            }
        },
        undefined
    );

export default i18n;
