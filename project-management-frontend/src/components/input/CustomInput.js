import React, { forwardRef } from "react";
import "./CustomInput.css";

const CustomInput = forwardRef(
    ({ label, type = "text", error, ...props }, ref) => (
        <div className="input-container">
            <input
                ref={ref}
                type={type}
                id={label}
                className={`custom-input ${error ? "error" : ""}`}
                {...props}
                placeholder=""
            />
            <label
                htmlFor={label}
                className={`custom-label ${error ? "error" : ""}`}
            >
                {label}
            </label>
        </div>
    ),
);

export default CustomInput;
