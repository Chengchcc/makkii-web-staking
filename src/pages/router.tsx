import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import PageHome from '@pages/home';
import PageDelegate from '@pages/operation/delegate';
import PageDelegations from '@pages/delegations';
import PagePendingUndelegation from '@pages/undelgations';
import PagePoolList from '@pages/pool_list';
import PageUndelegate from '@pages/operation/undelegate';
import PageWithdraw from '@pages/operation/withdraw';
import PageHistoryList from '@pages/history_lists';
import PageOperation from '@pages/operation';
import { withNavBar } from '@utils/history';
import { useSelector } from 'react-redux';

import './theme.less'

const withLockByAccount = (WrappedComponent) => props=> {
    // lock by account, if no account, can not visit
    const address = useSelector(({account})=>account.address);
    const {history} = props;
    const [lock ,setLock] = React.useState(true)
    React.useEffect(()=>{
        if(address === ''){
            history.push('/poollist');
        }else{
            setLock(false)
        }
    }, [address]);
    return lock? <div/>:<WrappedComponent {...props} />

}

const router = ({ history }) => {
    return (
            <Router history={history}>
                <Switch>
                    <Redirect exact from='/' to='home' />
                    <Route path='/home' component={withLockByAccount(PageHome)} />
                    <Route path='/delegate' component={withLockByAccount(withNavBar(PageDelegate))} />
                    <Route path='/delegations' component={withLockByAccount(withNavBar(PageDelegations))} />
                    <Route path='/pendingundelegation' component={withLockByAccount(withNavBar(PagePendingUndelegation))} />
                    <Route path='/poollist' component={withNavBar(PagePoolList)} />
                    <Route path='/undelegate' component={withLockByAccount(withNavBar(PageUndelegate))} />
                    <Route path='/withdraw' component={withLockByAccount(withNavBar(PageWithdraw))} />
                    <Route path='/history' component={withLockByAccount(withNavBar(PageHistoryList))} />
                    <Route path='/operation' component={withNavBar(PageOperation)} />
                </Switch>
            </Router>
    )
}

export default router
