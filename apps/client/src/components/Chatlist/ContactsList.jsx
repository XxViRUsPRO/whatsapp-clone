import React, { useEffect, useState } from "react";
import List from "./List";
import ContactsListItem from "./ContactsItem";
import axios from "axios";
import { GET_USERS_URL } from "@/utils/ApiRoutes";
import SearchBar from "./SearchBar";

function ContactsList() {
  const [contacts, setContacts] = useState({});
  const [filteredContacts, setFilteredContacts] = useState({});
  useEffect(() => {
    const getUsers = async () => {
      const {
        data: { data: users },
      } = await axios.get(GET_USERS_URL);
      setContacts(users);
      setFilteredContacts(users);
    };
    getUsers();
  }, []);

  const handleFilter = (e) => {
    const { value } = e.target;
    const filteredContacts = {};
    Object.entries(contacts).forEach(([letter, users]) => {
      const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      if (filteredUsers.length) {
        filteredContacts[letter] = filteredUsers;
      }
    });
    setFilteredContacts(filteredContacts);
  };

  return (
    <>
      <SearchBar onChange={handleFilter} noFilter />
      <List className="pr-1">
        {Object.entries(filteredContacts).map(([letter, users]) => {
          return (
            <div key={letter} id={letter}>
              <span className="sticky top-0 left-2 text-3xl font-thin text-icon-green z-[101] [&+div]:mt-2">
                {letter}
              </span>
              {users.map((user) => (
                <ContactsListItem
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  image={user.profileImg}
                  about={user.about}
                />
              ))}
            </div>
          );
        })}
      </List>
    </>
  );
}

export default ContactsList;
