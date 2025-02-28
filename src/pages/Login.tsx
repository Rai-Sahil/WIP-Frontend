import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://wip-backend-o2g9.onrender.com/login", { username, password });
      if (response.data.success) {
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("username", username);
        navigate("/quiz");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login error");
    }
  };

  return (
    <div className="flex justify-center flex-col items-center">
      <Input type="text" placeholder="Username" className="p-2 w-[30vh] mb-2" onChange={(e) => setUsername(e.target.value)} />
      <Input type="password" placeholder="Password" className="p-2 mb-5" onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
};

export default Login;

