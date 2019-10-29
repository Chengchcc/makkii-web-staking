/* eslint-disable global-require */
import React from 'react';
import { Ipool } from '@interfaces/types';
import IconRight from '@img/arrow_right.svg';
import Image from '@components/default-img';
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
        dataIndex: 'stakeSelf',
        render: (val) => <span>{val * 99} AION</span>
    },
    {
        title: 'Total Staked',
        dataIndex: 'stakeTotal',
        render: (val) => <span>{val.toFixed(3)} AION</span>
    },
    {
        title: 'Self Bond',
        dataIndex: 'stakeSelf',
        render: (val) => <span>{val.toFixed(3)} AION</span>
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
            <div className='pool-base'>
                <Image src={meta.logo} className='pool-logo' alt="" />
                <div style={{ marginTop: '10px' }}>
                    <span className={active === '0x01' ? 'poolActive' : 'poolInActive'} />
                    &nbsp;
                    {meta.name}
                </div>
            </div>
            <div className='pool-info'>
                {lists(INFOS, pool, {})}
            </div>
            <IconRight className='pool-detail-img' color='red' />
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
                    {meta.name}
                </div>
            </div>
            <div className='pool-info'>
                {lists(info, value, {})}
            </div>
        </div>
    )
}
