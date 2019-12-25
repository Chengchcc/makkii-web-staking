import * as React from "react";
import BigNumber from "bignumber.js";
import { Ipool } from "@interfaces/index";
import ArrorRight from "@img/arrow_long_right.svg";
import "./style.less";
import Image from "@components/default-img";
import { getPoolLogo } from "@utils/index";
import i18n from "@utils/i18n";

interface IProps {
    transfer: {
        amount: BigNumber;
        type: string;
        pool_from: Ipool;
        pool_to: Ipool;
    };
}

const transferType = type => {
    switch (type) {
        case "ADSDelegationTransferred":
            return i18n.t("transfers.label_transfering");
        case "TransferFinalized":
            return i18n.t("transfers.label_transferred");
        default:
            return "";
    }
};

const TransferItem: React.FC<IProps> = props => {
    const { transfer } = props;
    const {
        type,
        amount,
        pool_from = { meta: {} } as Ipool,
        pool_to = { meta: {} } as Ipool
    } = transfer;
    const pool_from_logo = getPoolLogo(pool_from);
    const pool_from_to = getPoolLogo(pool_to);
    return (
        <div className="transfer-item">
            <div className="transfer-pool">
                <Image src={pool_from_logo} className="pool-logo" alt="" />
                &nbsp; &nbsp;
                <span>{pool_from.meta.name || pool_from.address}</span>
            </div>
            <div className="transfer-to">
                <span>{`${amount.toFixed(5)} AION`}</span>
                <ArrorRight height={20} width={250} />
                <span>{transferType(type)}</span>
            </div>
            <div className="transfer-pool">
                <Image src={pool_from_to} className="pool-logo" alt="" />{" "}
                &nbsp;&nbsp;
                <span>{pool_to.meta.name || pool_to.address}</span>
            </div>
        </div>
    );
};

export default TransferItem;
