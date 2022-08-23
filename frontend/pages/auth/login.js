import React, { useState, useContext, useEffect } from 'react';
import { UserContext, ErrorContext } from 'context';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as controller from '../../controllers';
import {toast, Toaster} from 'react-hot-toast';


import Auth from '../../layouts/Auth.js';

export default function Login() {
  const router = useRouter();

  const [user, setUser] = useContext(UserContext);
  const [error, setError] = useContext(ErrorContext);

  const [email, setEmail] = useState('');
  const [hash, setHash] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let url = document.location.ancestorOrigins[0]?.match(/(?<=store-).*(?=.my)/)[0];
    setHash(url);
    if (controller.sessionController.get()) {
      router.push('/bulk-image-uploader/admin');
    }
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    const data = { email, password, hash };
    controller.authController.login(data)
      .then((response) =>{
        toast.success('Successfully Login!');
        const loginExpiration = Date.now() + 3600000;
        const user = response.data.data; 
        const access_token = response.data.data.accessToken;
        const context = response.data.data.context;
        controller.sessionController.create({access_token, user, loginExpiration, context});
        router.push('/bulk-image-uploader/admin')
      })
      .catch((error) =>{
        console.log(error)
        toast.error('Please check username or password!');
      })
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} duration="6000"/>
      {!user && (
        <div className="container mx-auto px-4 h-full">
          <div className="flex content-center items-center justify-center h-full ">
            <div className="w-full lg:w-4/12 sm:w-4/12 md:w-6/12 px-4">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 ">
                <div className="rounded-t mb-0 px-6 py-6"></div>
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <div className="max-w-screen-lg mx-auto pb-3 flex justify-center">
                    <img src="/icons/algolia-logo-with-text.png" alt="tranzetta-logo" className="w-7/12" />
                  </div>
                  <div className="text-md font-medium text-center mb-10">Sign in to your account</div>
                  <form onSubmit={handleLogin}>
                    <div className="relative w-full mb-3">
                      <label className="input-label" htmlFor="grid-password">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="text-blueGray-600 placeholder-blueGray-300 bg-white rounded input-field mt-2 border border-gray-30"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="relative w-full mb-3">
                      <label className="input-label" htmlFor="grid-password">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="text-blueGray-600 placeholder-blueGray-300 bg-white rounded input-field mt-2 border border-gray-30"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                        />
                        <i
                          className={`fas ${
                            showPassword ? 'fa-eye-slash' : 'fa-eye'
                          } absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-blueGray-300`}
                          onClick={() => setShowPassword(!showPassword)}
                        ></i>
                      </div>
                    </div>

                    <div className="flex flex-wrap mt-6 relative">
                      <div className="w-1/2 font-medium font-medium text-sm">
                        {/* <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox rounded border border-gray-900 border-opacity-30"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                          />
                          <span className="ml-2">Remember Me</span>
                        </label> */}
                      </div>
                      <div className="w-1/2 text-right font-medium text-sm">
                        <Link href="/algolia/auth/forgot-password">
                          <a href="/algolia/auth/forgot-password" className="text-blueGray-400 active:text-blueGray-600">
                            Forgot password?
                          </a>
                        </Link>
                      </div>
                    </div>

                    <div className="text-center mt-6">
                      <button className="h-11 bg-lightBlue-600 active:bg-lightBlue-600 btn-primary w-full" type="submit">
                      <span className="text-white text-base">Sign In</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              {/* <div className="flex flex-wrap mt-6 relative">
                <div className="">
                  <a href="#" onClick={e => e.preventDefault()} className="font-normal">
                    <small>Forgot password?</small>
                  </a>
                </div>
                {/* <div className="w-1/2 text-right">
                  <Link href="/auth/register">
                    <a href="#pablo" className="font-normal">
                      <small>Create new account</small>
                    </a>
                  </Link>
                </div> 
              </div> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Login.layout = Auth;
