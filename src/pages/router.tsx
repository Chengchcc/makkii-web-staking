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

const router = ({ history }) => {
    return (
            <Router history={history}>
                <Switch>
                    <Redirect exact from='/' to='home' />
                    <Route path='/home' component={PageHome} />
                    <Route path='/delegate' component={withNavBar(PageDelegate)} />
                    <Route path='/delegations' component={withNavBar(PageDelegations)} />
                    <Route path='/pendingundelegation' component={withNavBar(PagePendingUndelegation)} />
                    <Route path='/poollist' component={withNavBar(PagePoolList)} />
                    <Route path='/undelegate' component={withNavBar(PageUndelegate)} />
                    <Route path='/withdraw' component={withNavBar(PageWithdraw)} />
                    <Route path='/history' component={withNavBar(PageHistoryList)} />
                    <Route path='/operation' component={withNavBar(PageOperation)} />
                </Switch>
            </Router>
    )
}

export default router