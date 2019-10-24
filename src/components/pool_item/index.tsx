/* eslint-disable global-require */
import React from 'react';
import { Ipool } from '@interfaces/types';
import IconRight from '@img/arrow_right.svg';

import './style.less';

interface IPoolItem {
    pool: Ipool
    toPool: (pool: string)=>any
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
        dataIndex: 'stakeSelf',
        render: (val) => <span>{val * 99}</span>
    },
    {
        title: 'Total Staked',
        dataIndex: 'stakeTotal',
    },
    {
        title: 'Self Bond',
        dataIndex: 'stakeSelf'
    },
    {
        title: 'Weight',
        dataIndex: 'stakeWeight',
        render: val => {
            return <span>{val.times(100).toFixed(2)} %</span>
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
                            <div key={title}>
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
        <div className='pool-item-thrid' onClick={e=>{
            e.preventDefault();
            toPool(pool.address)
        }}>
            <div className='pool-base'>
                <img src={meta.logo} className='pool-logo'  alt=""/>
                <div style={{ marginTop: '10px' }}>
                    {meta.name}&nbsp;
                    <span className={active === '0x01' ? 'poolActive' : 'poolInActive'} />
                </div>
            </div>
            <div className='pool-info'>
                {lists(INFOS, pool, {})}
            </div>
            <IconRight className='pool-detail-img' color='red'/>
        </div>
    )
}


export const PoolItemMore: React.FC<IPoolItemWithMore> = props => {
    const { pool, info, value } = props;
    const { meta } = pool;
    return (
        <div className='pool-item-two'>
            <div className='pool-meta'>
                <img src={meta.logo} className='pool-logo'  alt=""/>
                <div className='pool-meta-name'>
                    {meta.name}
                </div>
            </div>
            <div className='pool-info'>
                {lists(info, value, {})}
            </div>
        </div>
    )
}
