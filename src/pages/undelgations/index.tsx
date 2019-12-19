import React from "react";
import MoreList from "@components/more_list";
import { PoolItemMore } from "@components/pool_item";
import { process_undelegations, unDelegationInfo } from "@pages/home";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { wsSendOnce } from "@utils/websocket";
import { createAction } from "@reducers/store";
import { operationType } from "@reducers/accountReducer";

const mapToState = ({ account }) => {
    return {
        address: account.address,
        undelegations: { ...account.undelegations },
        pools: { ...account.pools },
        undelegationAmount: account.undelegationAmount,
        pagination: { ...account.undelegationsPagination }
    };
};
let scrollTop = 0;
const Undelegations = props => {
    const { history } = props;
    const { undelegations, pools, address, pagination } = useSelector(
        mapToState,
        shallowEqual
    );
    const onRefresh = () => {
        wsSendOnce({ method: "undelegations", params: [address, 0, 10] });
    };
    const onReachEnd = () => {
        wsSendOnce({
            method: "undelegations",
            params: [address, pagination.current + 1, 10]
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
            data={process_undelegations(undelegations)}
            renderItem={el => {
                return (
                    <PoolItemMore
                        pool={pools[el.poolAddress]}
                        value={el}
                        info={unDelegationInfo}
                        toPool={toPool}
                    />
                );
            }}
        />
    );
};

export default Undelegations;
