import React, { useState, useContext } from 'react';
import { Navigate } from "react-router-dom";
import { AuthContext } from './context/AuthContext';
import CustomForm from "./components/CustomForm"
import { useNavigate } from "react-router-dom";
import axios from "axios"

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUser, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const suggestion = {
    text: "Already have an account?",
    linkText: "Login",
    link: "/login",
  }

  const formData = {
    title: "Signup",
    submitButtonTx: "Create account",
    submit: (callback) => {
      axios
        .post(`/adduser`, { username, password })
        .then(({ data }) => {
          if(data.error) {
            navigate("/login");
            return
          }
          setUser({ ...data });
          navigate("/home");
        })
        .catch(error => {
          if(!error.response && error.code === 'ERR_NETWORK')
            callback("Service is down")
          else
            callback(error.response.data.error);
        });
    },
    fields: [
      {
        required: true,
        displayed: "Username",
        name: "username",
        value: username,
        type: "text",
        changeHandler: e => setUsername(e.target.value)
      },
      {
        required: true,
        displayed: "Password",
        name: "password",
        value: password,
        type: "password",
        changeHandler: e => setPassword(e.target.value)
      },
    ]
  }

  return isAuthenticated()
    ? <Navigate to="/home" />
    : (
      <CustomForm
        formData={formData}
        suggestion={suggestion}
      />
  );
};
