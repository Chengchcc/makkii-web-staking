import React from "react";
import i18n from "@utils/i18n";
import { STATS } from "./constants";

interface Ifooter {
    loaderState: STATS;
    hasMore: boolean;
}

const footer: React.FC<Ifooter> = props => {
    const { loaderState, hasMore } = props;

    const className = `pull-load-footer-default ${hasMore ? "" : "nomore"}`;
    let content = hasMore
        ? i18n.t("refresh_control.footer_load_more")
        : i18n.t("refresh_control.footer_load_no_more");
    if (loaderState === STATS.loading) {
        content = i18n.t("refresh_control.footer_loading");
    }

    return (
        <div className={className}>
            <i />
            {content}
        </div>
    );
};
footer.defaultProps = {
    loaderState: STATS.init,
    hasMore: true
};

export default footer;
