import React, { useEffect, useState } from "react";
import Image from "next/image";
import Avatar from "@/components/common/Avatar";
import axios from "axios";
import { ONBOARD_USER_URL } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setNewUser, setUser } from "@/features/user/userSlice";

function onboarding() {
  const router = useRouter();

  const user = useSelector((state) => state.user.user);
  const newUser = useSelector((state) => state.user.newUser);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name);
  const [profileImg, setProfileImg] = useState(user?.profileImg);

  useEffect(() => {
    if (!newUser && !user?.email) router.push("/login");
    else if (!newUser && user?.email) router.push("/");
  }, [user, newUser, router]);

  const validateInput = () => {
    if (name.length < 3) {
      return false;
    }
    return true;
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) {
      return;
    }
    const { data } = await axios.post(ONBOARD_USER_URL, {
      email: user?.email,
      name,
      profileImg,
      about: "",
    });

    if (data.status) {
      const { name, email, profileImg } = data.data;
      dispatch(setNewUser(false));
      dispatch(setUser({ name, email, profileImg }));
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-panel-header-background text-white gap-2">
      <Image src="/whatsapp.gif" alt="WhatsApp" width={200} height={200} />
      <span className="text-5xl font-thin">WhatsApp</span>
      <div className="w-px h-[500px] mx-8 bg-gradient-to-tr from-transparent via-neutral-200 to-transparent opacity-40"></div>
      <div className="flex flex-col bg-input-background p-4 w-[400px] rounded-lg">
        <span className="text-3xl mb-4">Create an account</span>
        <form className="flex flex-col gap-y-2 h-full [&>label]:text-sm [&>label]:text-green-200 [&>input]:bg-panel-header-background [&>input]:px-2 [&>input]:rounded-md [&>input]:text-lg [&>input]:outline-0 [&>input]:border-b-2 [&>input]:border-green-300">
          <label htmlFor="name">Email:</label>
          <input
            type="text"
            value={user?.email}
            className="opacity-50"
            disabled
          />
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            defaultValue={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Avatar
            type="2xl"
            image={profileImg}
            setImage={setProfileImg}
            className="flex-1 my-8"
          />
          <input
            type="submit"
            value="Create"
            className="self-center p-2 w-1/4 text-xl cursor-pointer hover:bg-green-500 hover:ring-8 hover:ring-green-700 active:scale-95 duration-150"
            onClick={onSubmit}
          />
        </form>
      </div>
    </div>
  );
}

export default onboarding;
