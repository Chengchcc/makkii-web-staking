import React from 'react';

const defaultImg = require('@img/default.png');

const Image = props => {
    const { src, ...reset } = props;
    const [source, setSource] = React.useState(null);
    React.useEffect(() => {
        if (src !== source) {
            setSource(src);
        }
    }, [src]);
    return <img src={source} {...reset} alt=""
    onError={()=>{
        setSource(defaultImg)
    }}
    />
}

export default Image