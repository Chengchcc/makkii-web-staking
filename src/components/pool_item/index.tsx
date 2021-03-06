/* eslint-disable global-require */
import React from "react";
import { Ipool } from "@interfaces/types";
import IconRight from "@img/arrow_right.svg";
import Image from "@components/default-img";
import SwipeAction from "@components/swipe_action";
import { formatPoolName, getPoolLogo } from "@utils/index";
import i18n from "@utils/i18n";
import "./style.less";

interface IPoolItem {
    pool: Ipool;
    toPool: (pool: string) => any;
}

interface IPoolItemWithMore {
    pool: Ipool;
    value: any;
    info: Array<Iinfo>;
    toPool: (pool: string) => any;
}

export interface Iinfo {
    title: string;
    dataIndex?: string;
    render?: (val: any, extra?: any) => React.ReactNode;
}

// const INFOS: Array<Iinfo> = [
//     {
//         title: 'Capacity',
//         render: (val) => <span>{val.stakeSelf.times(100).minus(val.stakeTotal).toFixed(0)} AION</span>
//     },
//     {
//         title: 'Total Staked',
//         dataIndex: 'stakeTotal',
//         render: (val) => <span>{`${val.toFixed(0)}`} AION</span>
//     },
//     {
//         title: 'Fees',
//         dataIndex: 'fee',
//         render: (val) => <span>{`${val.times(100).toFixed(4)}`}% AION</span>
//     },
//     {
//         title: 'Weight',
//         dataIndex: 'stakeWeight',
//         render: val => {
//             return <span>{val.times(100).toFixed(4)} %</span>
//         }
//     }
// ]

const lists = (info, src, extra) => {
    return (
        <>
            {info.map(el => {
                const { dataIndex, title, render } = el;
                const val = dataIndex ? src[dataIndex] : src;
                if (render) {
                    return (
                        <div key={title} className="pool-info-label-list">
                            <span>{i18n.t(title)}: </span>
                            <span>{render(val, extra)}</span>
                        </div>
                    );
                }
                return (
                    <div key={title} className="pool-info-label-list">
                        <span>{i18n.t(title)}: </span>
                        <span>{val.toString()}</span>
                    </div>
                );
            })}
        </>
    );
};

export const PoolItem: React.FC<IPoolItem> = props => {
    const { pool, toPool } = props;
    const { meta, active } = pool;
    const defaultLogo = require("@/img/default.png");
    const poolLogo = getPoolLogo(pool);
    return (
        <SwipeAction>
            <div
                className="pool-item-thrid"
                onClick={e => {
                    e.preventDefault();
                    toPool(pool.address);
                    window.scrollTo(0, 0);
                }}
            >
                {/* <div className='pool-base'>
                <Image src={poolLogo} className='pool-logo' alt="" />
                <div>
                    <span className={active === '0x01' ? 'poolActive' : 'poolInActive'} />
                    &nbsp;
                    {formatPoolName(meta.name || pool.address)}
                </div>
            </div>
            <div className='pool-info'>
                {lists(INFOS, pool, {})}
            </div>
            <IconRight className='pool-detail-img'/> */}
                <div>
                    <img
                        style={{
                            border: poolLogo ? "" : "1px solid #ddd",
                            boxSizing: "border-box"
                        }}
                        className="left-logo"
                        src={poolLogo || defaultLogo}
                        alt=""
                    />
                </div>
                <div
                    style={{
                        backgroundColor: active ? "#08de00" : "#e84f4f"
                    }}
                />
                <span>{meta.name || pool.address}</span>
                <IconRight className="pool-detail-img" />
                <div className="stake-weight">
                    {pool.performance.multipliedBy(100, 10).toFixed(5)}%
                </div>
            </div>
        </SwipeAction>
    );
};

export const PoolItemMore: React.FC<IPoolItemWithMore> = props => {
    const { pool, info, value, toPool } = props;
    const { meta } = pool;
    const poolLogo = getPoolLogo(pool);
    return (
        <div
            className="pool-item-two"
            onClick={e => {
                e.preventDefault();
                toPool(pool.address);
                window.scrollTo(0, 0);
            }}
        >
            <div className="pool-meta">
                <Image src={poolLogo} className="pool-logo" alt="" />
                <div className="pool-meta-name">
                    {formatPoolName(meta.name || pool.address)}
                </div>
            </div>
            <div className="pool-info">{lists(info, value, {})}</div>
        </div>
    );
};
