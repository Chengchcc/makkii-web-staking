/* eslint-disable global-require */
import React from 'react';
import { Ipool } from '@interfaces/types';
import IconRight from '@img/arrow_right.svg';
import Image from '@components/default-img';
import { formatPoolName} from '@utils/index';
import './style.less';

interface IPoolItem {
    pool: Ipool
    toPool: (pool: string) => any
}

interface IPoolItemWithMore {
    pool: Ipool
    value: any
    info: Array<Iinfo>
}

export interface Iinfo {
    title: string
    dataIndex?: string
    render?: (val: any, extra?: any) => React.ReactNode
}

const INFOS: Array<Iinfo> = [
    {
        title: 'Capacity',
        render: (val) => <span>{val.stakeSelf.times(100).minus(val.stakeTotal).toFixed(0)} AION</span>
    },
    {
        title: 'Total Staked',
        dataIndex: 'stakeTotal',
        render: (val) => <span>{`${val.toFixed(0)}`} AION</span>
    },
    {
        title: 'Fees',
        dataIndex: 'fee',
        render: (val) => <span>{`${val.times(100).toFixed(4)}`}% AION</span>
    },
    {
        title: 'Weight',
        dataIndex: 'stakeWeight',
        render: val => {
            return <span>{val.times(100).toFixed(4)} %</span>
        }
    }
]


const lists = (info, src, extra) => {
    return (
        <>
            {
                info.map(el => {
                    const { dataIndex, title, render } = el;
                    const val = dataIndex ? src[dataIndex] : src;
                    if (render) {
                        return (
                            <div key={title} className='pool-info-label-list'>
                                <span>{title} :</span>
                                <span>{render(val, extra)}</span>
                            </div>
                        )
                    }
                    return (
                        <div key={title} className='pool-info-label-list'>
                            <span>{title} :</span>
                            <span>{val.toString()}</span>
                        </div>
                    )
                })
            }
        </>
    )
}

export const PoolItem: React.FC<IPoolItem> = props => {
    const { pool, toPool } = props;
    const { meta, active } = pool;
    return (
        <div className='pool-item-thrid' onClick={e => {
            e.preventDefault();
            toPool(pool.address)
            window.scrollTo(0, 0)
        }}>
            {/* <div className='pool-base'>
                <Image src={meta.logo} className='pool-logo' alt="" />
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
            <div className="left-logo" style={{background: meta.logo ? `url(${meta.logo})` : `#e8eaed`}}>
                {/*<div style={{borderColor: active === "0x01" ? "#08de00" : "#e84f4f"}}></div>*/}
            </div>
            <div style={{backgroundColor: active === "0x01" ? "#08de00" : "#e84f4f"}}></div>
            <span>{meta.name || pool.address}</span>
            <IconRight className='pool-detail-img'/>
            <div className="stake-weight">
               {pool.performance.multipliedBy(100, 10).toFixed(5)}%
            </div>
        </div>
    )
}


export const PoolItemMore: React.FC<IPoolItemWithMore> = props => {
    const { pool, info, value } = props;
    const { meta } = pool;
    return (
        <div className='pool-item-two'>
            <div className='pool-meta'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <div className='pool-meta-name'>
                    {formatPoolName(meta.name || pool.address)}
                </div>
            </div>
            <div className='pool-info'>
                {lists(info, value, {})}
            </div>
        </div>
    )
}
