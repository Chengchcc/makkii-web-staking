import React from "react";
import MoreList from "../components/more_list";

const tmp = "1234567890";
const data = tmp.repeat(3).split("");
export default () => {
    const [state, setState] = React.useState({
        data,
        hasMore: true
    });
    const onRefresh = () => {
        console.log("onRefresh");
        setTimeout(() => {
            setState({
                ...state,
                data: [...state.data]
            });
        }, 2000);
    };
    const onReachEnd = () => {
        setTimeout(() => {
            setState({
                ...state,
                data: state.data.concat(10)
            });
        }, 2000);
    };

    return (
        <MoreList
            title="12345"
            onReachEnd={onReachEnd}
            onRefresh={onRefresh}
            hasMore
            data={state.data}
            renderItem={item => {
                return (
                    <div style={{ width: "100%", textAlign: "center" }}>
                        {item}
                    </div>
                );
            }}
        />
    );
};
