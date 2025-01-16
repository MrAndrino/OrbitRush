"use client";
import LoginRegisterBox from '@/components/login-register/login-registerBox';

function AuthPage() {

  return (
    <div className=" bg-[url('/images/OrbitRush-Logo.png')] bg-cover bg-center ">
      <div className='bg-black/55 backdrop-blur-md w-full flex justify-center'>
        <div className="min-h-[100vh] w-[50%] pt-[20vh]">
          <LoginRegisterBox />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
