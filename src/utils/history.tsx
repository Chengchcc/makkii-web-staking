import React from 'react';
import NavBar from '@components/navbar'

const createHistory = require("history").createBrowserHistory

declare const BASENAME: string;

const history = createHistory({
    basename: `/${BASENAME}`
    
});
export default history;
export const withNavBar = (WrappedCompnented) => (props) => {
    const {goBack,canGoBack} = WrappedCompnented;
    let hasNavbar = history.length >1;
    if(canGoBack&&(typeof canGoBack ==='function')){
        hasNavbar = hasNavbar && canGoBack();
    }
    return (
        <>
            <div style={{marginTop: hasNavbar?'35px':'0px'}}>
             <WrappedCompnented {...props} />
            </div>
            {
                hasNavbar ? <NavBar onLeftClick={() => {
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