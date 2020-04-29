import React, { useState } from "react";
import { Wrap } from "../../components/wrap";
import IsAuthenticated from "../../components/auth/IsAuthenticated";
import IsAllowed from "../../components/auth/IsAllowed";

function Page({ children, isServer }) {
    return ( <>
        <IsAuthenticated target = "authenticated"> 
        IsAuthenticated = true 
        </IsAuthenticated> 
        <IsAuthenticated target="unauthenticated">
         IsAuthenticated = false 
        </IsAuthenticated> 
        <IsAllowed org={"helloworld"}> yes </IsAllowed>
        <IsAllowed org={"12Apr2020 Test"}> yes </IsAllowed>
         </>
    );
}
export default ({ isServer }) => <Wrap> <Page isServer = { isServer } > </Page></Wrap >