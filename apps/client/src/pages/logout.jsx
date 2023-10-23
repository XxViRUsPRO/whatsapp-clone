import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "@/features/user/userSlice";
import { auth } from "@/utils/FirebaseConfig";
import { signOut } from "firebase/auth";
import Empty from "@/components/Empty";

function logout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (redirect) {
      router.push("/");
    }
  }, [redirect]);

  useEffect(() => {
    signOut(auth)
      .then(() => {
        dispatch(logoutAction());
        setRedirect(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="h-screen w-screen grid columns-4 bg-panel-header-background">
      <Empty />
    </div>
  );
}

export default logout;
