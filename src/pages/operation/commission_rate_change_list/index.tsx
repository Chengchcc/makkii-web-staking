// libs
import i18n from "@utils/i18n";
// utils
import { formatAddress } from "@utils/index";
import React from "react";
// styles
import "./index.less";

const titles = {
    rate: "commission_rate_change.rate",
    tx_hash: "commission_rate_change.tx_hash",
    block_number: "commission_rate_change.block_number",
    block_number_remain: "commission_rate_change.block_number_remain",
    time: "commission_rate_change.time",
};
const block_remain_to_time = (time_remain) => {
    let suffix = null;
    if (time_remain > 8640) { suffix =  <>{Math.ceil(time_remain / 8640)} {i18n.t("unit_day2")}</>;
    } else if (time_remain > 360) { suffix = <>{Math.ceil(time_remain / 360)} {i18n.t("unit_hour")}</>;
    } else if (time_remain > 6) { suffix = <>{Math.ceil(time_remain / 6)}  {i18n.t("unit_minute")}</>;
    } else { suffix = <>{ time_remain > 0 ?
        `≈ ${  time_remain * 10  }${i18n.t("unit_second")}` : i18n.t("wait_for_finalization") }</>;
    }
    return time_remain > 6 ? <>≈ {suffix}</> : suffix;
};
const CommissionRateChangeItem = (props) => {
    const { oldFee: old_fee, data } = props;
    return (
        <div className="commission-rate_change-item">
            <div><span>{`${i18n.t(titles.time)}`}:</span> <span>{`${new Date(data.block_timestamp).Format("yyyy-MM-dd hh:mm:ss", 24)}`}</span></div>
            <div><span>{`${i18n.t(titles.rate)}: `}</span><span>{`${old_fee.multipliedBy(100, 10).toFixed(4)}% -> ${data.commission_rate.toFixed(4)}%`}</span></div>
            <div>
                <span>{`${i18n.t(titles.tx_hash)}`}:</span><span> {`${formatAddress(data.transaction_hash)}`}</span>
            </div>
            <div><span>{`${i18n.t(titles.block_number)}`}:</span> <span>{`${data.block_number}`}</span></div>
            <div>
                <span>{`${i18n.t(titles.block_number_remain)}`}:
                </span><span>{data.block_number_remain === undefined ? i18n.t("estimating") :
                <>{data.block_number_remain} {block_remain_to_time(data.block_number_remain)}</>}
                </span>
                </div>
        </div>
    );
};
const CommissionRateChangeList = (props) => {
    const { commissionRateChanges, pool } = props;
    if ((!commissionRateChanges) || !commissionRateChanges.length) { return null; }
    return (
        <div className="commission-rate-changes-list">
        <p className="commission-rate-changes-title">{i18n.t("commission_rate_change.commission_rate_changes")}</p>
    {
        commissionRateChanges.map((v) => {
            return (
                <CommissionRateChangeItem data={v} oldFee={pool.fee} key={v.id}/>
            );
        })
    }
        </div>
    );
};
export default CommissionRateChangeList;
