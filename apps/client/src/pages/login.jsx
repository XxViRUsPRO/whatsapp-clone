import { auth } from "@/utils/FirebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/router";
import axios from "axios";
import { CHECK_USER_URL } from "@/utils/ApiRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setNewUser, setUser } from "@/features/user/userSlice";

function login() {
  const router = useRouter();

  const user = useSelector((state) => state.user.user);
  const newUser = useSelector((state) => state.user.newUser);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id && !newUser) router.push("/");
  }, [user, newUser]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const {
      user: { displayName: name, email, photoURL: profileImg },
    } = await signInWithPopup(auth, provider);
    try {
      if (email) {
        const { data } = await axios.post(CHECK_USER_URL, {
          email,
        });
        if (!data.status) {
          dispatch(setNewUser(true));
          dispatch(setUser({ name, email, profileImg }));
          router.push("/onboarding");
        } else {
          const {
            data: { id, email, name, profileImg: pfp, about },
          } = data;
          dispatch(setNewUser(false));
          dispatch(setUser({ id, email, name, profileImg: pfp, about }));
          router.push("/");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center h-screen w-screen bg-panel-header-background text-white">
      <div>
        <Image src="/whatsapp.gif" alt="WhatsApp" width={200} height={200} />
        <span className="text-5xl font-thin">WhatsApp</span>
      </div>
      <div className="w-[90vw] h-px md:w-px md:h-[50vh] mx-8 bg-gradient-to-tr from-transparent via-neutral-200 to-transparent opacity-40"></div>
      <ul className="flex flex-col gap-2 bg-input-background p-3 rounded-lg [&>li]:bg-search-input-container-background [&>li]:p-2 [&>li]:rounded-lg">
        {[...Array(3)].map((_, i) => (
          <li key={i}>
            <button
              className="flex justify-center items-center gap-2"
              onClick={handleLogin}
            >
              <FcGoogle className="text-4xl" /> Login with Google
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default login;
