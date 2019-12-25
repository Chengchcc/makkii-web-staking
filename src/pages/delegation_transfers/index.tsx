import React from "react";
import MoreList from "@components/more_list";
import { process_transfers } from "@pages/home";
import { useSelector, shallowEqual } from "react-redux";
import { wsSendOnce } from "@utils/websocket";
import TransferItem from "@components/transfer_item";

const mapToState = ({ account }) => {
    return {
        address: account.address,
        delegationTransfers: { ...account.delegationTransfers },
        pagination: { ...account.delegationTransfersPagination }
    };
};
let scrollTop = 0;
const Transfers = () => {
    const { delegationTransfers, address, pagination } = useSelector(
        mapToState,
        shallowEqual
    );
    const onRefresh = () => {
        wsSendOnce({
            method: "delegation_transfers",
            params: [address, 0, 10]
        });
    };
    const onReachEnd = () => {
        wsSendOnce({
            method: "delegation_transfers",
            params: [address, pagination.current + 1, 10]
        });
    };
    const hasMore = pagination.current + 1 < pagination.total;

    React.useEffect(() => {
        const element =
            document.getElementById("pullLoadContainer") || document.body;
        const handleScollTop = e => {
            scrollTop = e.target.scrollTop;
        };
        element.addEventListener("scroll", handleScollTop);
        if (scrollTop && navigator.userAgent.match("Android")) {
            element.scrollTop = scrollTop;
        }
        return () => {
            element.removeEventListener("scroll", handleScollTop);
        };
    });

    return (
        <MoreList
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={hasMore}
            data={process_transfers(delegationTransfers)}
            renderItem={el => {
                return <TransferItem transfer={el} />;
            }}
        />
    );
};

export default Transfers;
