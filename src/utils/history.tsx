import React from 'react';
import NavBar from '@components/navbar'

const createHistory = require("history").createBrowserHistory

declare const BASENAME: string;

const history = createHistory({
    basename: `/${BASENAME}`
    
});
export default history;
export const withNavBar = (WrappedCompnented) => (props) => {
    const {goBack} = WrappedCompnented;
    const {history: history_} = window;
    const canGoBack = history_.length >1;
    return (
        <>
            <div style={{marginTop: canGoBack?'40px':'0px'}}>
             <WrappedCompnented {...props} />
            </div>
            {
                canGoBack ? <NavBar onLeftClick={() => {
                    if(goBack){
                        goBack();
                    }else {
                        history.go(-1);
                    }
                }} /> : null
            }
        </>
    )
}