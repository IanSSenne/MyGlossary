import React, { useEffect } from "react";
export default ({ target, auto = true, instant = false }) => {
    useEffect(() => {
        const id = setTimeout(() => {
            if (globalThis.location && auto) globalThis.location.replace(target);
        }, instant ? 0 : 1000)
        return () => {
            clearTimeout(id);
        }
    }, [])
    return <a href={target}>if not automatically redirected please click here.</a>
}