"use client";
import Head from "next/head";
import Image from "next/image";
import { FaLock } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import useRouter for redirection
import axios from "axios";
import Swal from "sweetalert2"; // ✅ Import SweetAlert for notifications

const API_BASE_URL = "http://15.206.128.214:5000"; // ✅ Backend URL

export default function Login() {
  const router = useRouter();

  // ✅ State for Email & Password
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // ✅ Handle Forgot Password Popup
  const handleForgotPassword = () => {
    Swal.fire({
      icon: "info",
      title: "Forgot Password?",
      html: `<p>If you want to forgot your password and need a reset, please contact the administrator:</p><br />
             <p><strong>Admin Email:</strong> <a href="mailto:jahaann@jiotp.com" style="color:#3498db;">jahaann@jiotp.com</a></p>`,
      background: "#222D3B",
      color: "#ffffff",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });
  };

  // ✅ Handle Form Submission (Login API)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      if (response.data && response.data.access_token) {
        // ✅ Store Token
        localStorage.setItem("token", response.data.access_token);

        // ✅ Store User Info (Optional)
        localStorage.setItem("user", JSON.stringify(response.data.user));

        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          // text: "Redirecting to Plant Summary...",
          background: "#222D3B",
          color: "#ffffff",
          showConfirmButton: false,
          timer: 1500, // ✅ Auto close
        });

        // ✅ Redirect to PlantSummary Page
        setTimeout(() => {
          router.push("/PlantSummary");
        }, 1500);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response?.data?.message || "Invalid email or password.",
        background: "#222D3B",
        color: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-gray-900">
        {/* Background Video */}
        <Image
          src="/Nexalyze-Blue-Black.png"
          alt="Nexalyze Blue Black Logo"
          width={200}
          className="absolute top-4 left-4 z-50"
          height={150}
        />
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source
              src="https://nexalyze.com/wp-content/uploads/2024/10/3129957-uhd_3840_2160_25fps-2.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Login Form */}
        <form
          className="relative z-10 w-[90%] max-w-md rounded-lg bg-gray-900 bg-opacity-80 p-6 shadow-lg"
          onSubmit={handleLogin}
        >
          <div className="text-center">
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gray-400 text-gray-900 mx-auto">
              <FaLock className="text-3xl" />
            </span>
            <h2 className="mt-2 text-white text-xl font-semibold">Login</h2>
          </div>

          {/* Input Fields */}
          <div className="mt-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:outline-none transition"
            />
          </div>
          <div className="mt-4 mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-600 bg-transparent px-3 py-2 text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:outline-none transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-md border border-white bg-transparent px-4 py-2 text-white transition hover:bg-white hover:text-gray-900"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot Password */}
          <a
            href="#"
            className="mt-3 block text-center text-sm text-white opacity-70 hover:opacity-100 cursor-pointer"
            onClick={handleForgotPassword} // ✅ Call function on click
          >
            Forgot password?
          </a>
        </form>
      </div>
    </>
  );
}
