import React from "react";
import MoreList from "@components/more_list";
import { PoolItemMore } from "@components/pool_item";
import { process_delegations, delegationInfo } from "@pages/home";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { wsSendOnce } from "@utils/websocket";
import { createAction } from "@reducers/store";
import { operationType } from "@reducers/accountReducer";

const mapToState = ({ account }) => {
    return {
        address: account.address,
        delegations: { ...account.delegations },
        pools: { ...account.pools },
        stakedAmount: account.stakedAmount,
        pagination: { ...account.delegationsPagination }
    };
};
let scrollTop = 0;
const Delegations = props => {
    const { history } = props;
    const { delegations, pools, address, pagination } = useSelector(
        mapToState,
        shallowEqual
    );
    const onRefresh = () => {
        wsSendOnce({ method: "delegations", params: [address, 0, 10] });
    };
    const onReachEnd = () => {
        wsSendOnce({
            method: "delegations",
            params: [address, pagination.current, 10]
        });
    };
    const dispatch = useDispatch();
    const toPool = pool => {
        dispatch(
            createAction("account/update")({
                operation: {
                    operation: operationType.default,
                    pool
                }
            })
        );
        history.push("/operation");
    };
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
    const hasMore = pagination.current + 1 < pagination.total;
    return (
        <MoreList
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore={hasMore}
            data={process_delegations(delegations)}
            renderItem={el => {
                return (
                    <PoolItemMore
                        pool={pools[el.poolAddress]}
                        value={el}
                        info={delegationInfo}
                        toPool={toPool}
                    />
                );
            }}
        />
    );
};

export default Delegations;
