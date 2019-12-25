import * as React from "react";
import history from "@utils/history";
import store, { createAction } from "@reducers/store";
import { operationType } from "@reducers/accountReducer";
import { PoolItem, PoolItemMore } from "@components/pool_item";
import TransactionItem from "@components/transaction_item";
import i18n from "@utils/i18n";
import TransferItem from "@components/transfer_item";
import Card from "./card";
import { delegationInfo, unDelegationInfo, accountInfo } from "./template";

const toPoolList = () => {
    const { operation } = store.getState().account;
    store.dispatch(
        createAction("account/update")({
            operation: {
                ...operation,
                type: operationType.default // reset operation
            }
        })
    );
    history.push("/poollist");
};

const toPool = pool => {
    const { operation } = store.getState().account;
    store.dispatch(
        createAction("account/update")({
            operation: {
                ...operation,
                pool
            }
        })
    );
    history.push("/operation");
};

const toDelegations = () => {
    history.push("/delegations");
};
const toPendingUndlegation = () => {
    history.push("/pendingundelegation");
};

const toHistoryList = () => {
    history.push("/history");
};

const toTransfres = () => {
    history.push("/transfers");
};

export const renderPools = (title, lists_) => {
    const sorter = (a: any, b: any) => {
        return b.performance.toNumber() - a.performance.toNumber();
    };

    const lists = Object.values(lists_)
        .sort(sorter)
        .slice(0, 3);
    return (
        <Card
            title={title}
            lists={lists}
            renderItem={(el, key) => {
                return <PoolItem key={key} pool={el} toPool={toPool} />;
            }}
            handleMore={toPoolList}
        />
    );
};

const renderPoolsMore = (title, lists, info, handleMore) => {
    const { pools } = store.getState().account;
    return (
        <Card
            title={title}
            lists={lists}
            renderItem={(el, key) => {
                return (
                    <PoolItemMore
                        key={key}
                        pool={pools[el.poolAddress]}
                        value={el}
                        info={info}
                        toPool={toPool}
                    />
                );
            }}
            handleMore={handleMore}
        />
    );
};

export const renderDelegations = (title, lists) => {
    return renderPoolsMore(title, lists, delegationInfo, toDelegations);
};

export const renderUnDelegations = (title, lists) => {
    return renderPoolsMore(
        title,
        lists,
        unDelegationInfo,
        toPendingUndlegation
    );
};

export const renderTransaction = (title, lists) => {
    const { pools } = store.getState().account;
    return (
        <Card
            title={title}
            lists={lists}
            renderItem={(el, key) => {
                return (
                    <TransactionItem
                        key={key}
                        pool={pools[el.pool]}
                        transaction={el}
                    />
                );
            }}
            handleMore={toHistoryList}
        />
    );
};

export const renderAccountInfo = src => {
    return (
        <div className="header-info">
            {accountInfo.map(el => {
                const { dataIndex, title, render } = el;
                const val = src[dataIndex];
                return (
                    <div key={title} className="header-info-item ">
                        <div className="header-info-item-value">
                            {render(val)}
                        </div>
                        <div className="header-info-item-title">
                            {i18n.t(title)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const renderTransfers = (title, lists) => {
    return (
        <Card
            title={title}
            lists={lists}
            renderItem={el => {
                return <TransferItem transfer={el} />;
            }}
            handleMore={toTransfres}
        />
    );
};
