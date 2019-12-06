import React from "react";
import i18n from "@utils/i18n";
import { STATS } from "./constants";

interface Iheader {
    loaderState: STATS;
}

const header: React.FC<Iheader> = props => {
    const { loaderState } = props;
    let content = "";
    switch (loaderState) {
        case STATS.pulling:
            content = i18n.t("refresh_control.header_pulling");
            break;
        case STATS.enough:
            content = i18n.t("refresh_control.header_pulling_enough");
            break;
        case STATS.refreshing:
            content = i18n.t("refresh_control.header_refreshing");
            break;
        case STATS.refreshed:
            content = i18n.t("refresh_control.header_refreshed");
            break;
        default:
    }
    return (
        <div className="pull-load-head-default">
            <i />
            {content}
        </div>
    );
};
header.defaultProps = {
    loaderState: STATS.init
};

export default header;
