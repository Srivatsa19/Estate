import { useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import apiRequests from "../../lib/apiRequests";
import { AuthContext } from "../../context/AuthContext";

function Login() {

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {updateUser} = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");
    try {
      const res = await apiRequests.post("/auth/login", {
        username, password
      })
      updateUser(res.data)
      navigate("/")
    }
    catch (err) {
      console.log(err)
      setError(err.response.data.message)
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <h1>Welcome back</h1>
          <input name="username" required minLength={2} maxLength={20} type="text" placeholder="Username" />
          <input name="password" required type="password" placeholder="Password" />
          {error && <span>{error}</span>}
          <button disabled={isLoading}>Login</button>
          <Link to="/register">{"Don't"} have an account?  Signup</Link>
        </form>
      </div>
      <div className="imgContainer">
        <img src="/bg.png" alt="" />
      </div>
    </div>
  );
}

export default Login;
