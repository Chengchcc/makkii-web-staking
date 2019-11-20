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
// eslint-disable-next-line import/no-extraneous-dependencies
import { parse } from 'querystring';
import i18n from '@utils/i18n';

import './theme.less'

const withLockByAccount = (WrappedComponent) => props => {
    // lock by account, if no account, can not visit
    const address = useSelector(({ account }) => account.address);
    const { history } = props;
    const [lock, setLock] = React.useState(true)
    React.useEffect(() => {
        if (address === '') {
            history.push('/poollist');
        } else {
            setLock(false)
        }
    }, [address]);
    return lock ? <div /> : <WrappedComponent {...props} />

}

const router = ({ history }) => {
    const url = new URL(window.location.href);
    const querystr = url.search ? url.search.substr(1) : "";
    const query = parse(querystr);
    if (query.lang && query.lang.includes('zh')) {
        i18n.changeLanguage('zh')
    }
    return (
        <Router history={history}>
            <Switch>
                <Redirect exact from='/' to='home' />
                <Route path='/home' component={withLockByAccount(PageHome)} />
                <Route path='/delegate' component={withLockByAccount(withNavBar(PageDelegate))} />
                <Route path='/delegations' component={withLockByAccount(withNavBar(PageDelegations, i18n.t("delegations.title")))} />
                <Route path='/pendingundelegation' component={withLockByAccount(withNavBar(PagePendingUndelegation, i18n.t("undelegations.title")))} />
                <Route path='/poollist' component={withNavBar(PagePoolList, i18n.t("pool_lists.title"))} />
                <Route path='/undelegate' component={withLockByAccount(withNavBar(PageUndelegate, ""))} />
                <Route path='/withdraw' component={withLockByAccount(withNavBar(PageWithdraw, ""))} />
                <Route path='/history' component={withLockByAccount(withNavBar(PageHistoryList, i18n.t("history.title")))} />
                <Route path='/operation' component={withNavBar(PageOperation)} />
            </Switch>
        </Router>
    )
}

export default router
