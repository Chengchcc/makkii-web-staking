import React from "react";
import "./style.less";

interface Iloading {
    size?: string;
    width?: string;
    secondaryColor?: string;
    primaryColor?: string;
    duration?: string;
    timingFunction?: string;
    direction?: string;
}
const LoadingSpin: React.FC<Iloading> = props => {
    const {
        size = "60px",
        width = "6px",
        secondaryColor = "#cccccc",
        primaryColor = "#f50",
        duration = "1.4s",
        timingFunction = "ease-in-out",
        direction = "normal"
    } = props;

    return (
        <div
            className="loading"
            style={{
                height: size,
                width: size,
                borderWidth: width,
                animationDuration: duration,
                animationTimingFunction: timingFunction,
                animationDirection: direction,
                borderColor: secondaryColor,
                borderLeftColor: primaryColor,
                borderTopColor: primaryColor
            }}
        />
    );
};

export default LoadingSpin;
