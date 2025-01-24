'use client';

import Button from '@/components/button/button';
import Line from '@/components/line/line';
import { useAuth } from '@/context/authcontext';

export default function MenuPage() {
  const {logout} = useAuth();

  return (
    <div className="flex flex-col gap-[10vh] text-center min-h-[100vh]">

      {/* Encabezado */}
      <div className="relative bg-[url('/images/OrbitRush-Fondo.png')] bg-cover bg-center">
        <div className="h-[45vh] select-none">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md flex flex-col items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-5xl">
            <img src='images/OrbitRush-Title.png' alt='' className='h-[12rem]'></img>
            <p className='pt-[1rem] text-white'>MENU MENU MENU MENU</p>
          </div>
        </div>
        <Line />
      </div>

      <div className='w-5/6 text-xl mx-auto'>MENU MENU MENU MENU MENU MENU MENU</div>

      {/* Botonera */}
      <div className="flex justify-center gap-[5rem] select-none">
        <Button href="/login" color="blue" className="w-[15rem] h-[5rem] text-3xl">
          MENU
        </Button>
        <Button onClick={logout} color="orange" className="w-[15rem] h-[5rem] text-3xl">
          MENU
        </Button>
      </div>
    </div>
  );
}