import React from "react";
import { Wrap } from "../components/wrap";
import LoginContainer from "../components/auth/LoginContainer";
// import "../scss/global.scss";
import "@blueprintjs/core/lib/css/blueprint.css";

function Page() {
  return (
    <>
      <LoginContainer></LoginContainer>
    </>
  );
}
export default () => <Wrap><Page></Page></Wrap>
