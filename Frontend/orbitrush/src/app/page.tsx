'use client';

import { useState } from 'react';
import Button from '@/components/button/button';
import Line from '@/components/line/line';
import Modal from '@/components/modal/modal';
import { useAuth } from '@/context/authcontext';
import Instructions from '@/components/instructions/instructions';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const {token} = useAuth()

  return (
    <div className="flex flex-col gap-[10vh] text-center min-h-[100vh]">

      {/* Encabezado */}
      <div className="relative bg-[url('/images/OrbitRush-Fondo.png')] bg-cover bg-center">
        <div className="h-[45vh] select-none">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md flex flex-col items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-5xl">
            <img src='images/OrbitRush-Title.png' alt='' className='h-[12rem]'></img>
            <p className='pt-[1rem] text-white'>Tu nueva forma de jugar Orbito</p>
          </div>
        </div>
        <Line />
      </div>

      <div className='w-5/6 text-xl mx-auto'>Orbito es un emocionante juego de mesa tridimensional que desafía la lógica y la visión espacial de los jugadores. Con un diseño innovador y bolas de colores vibrantes, ofrece una experiencia única que combina estrategia y diversión. Perfecto para todas las edades, Orbito garantiza momentos de competencia amigable mientras pone a prueba tu capacidad para anticiparte y planificar en múltiples dimensiones.</div>

      {/* Botonera */}
      <div className="flex justify-center gap-[5rem] select-none">
        {token ? (
          <Button href="/menu" color="blue" className="w-[15rem] h-[5rem] text-3xl">
            ¡Juega Ahora!
          </Button>
        ) : (
          <Button href="/login" color="blue" className="w-[15rem] h-[5rem] text-3xl">
            ¡Juega Ahora!
          </Button>
        )}
        <Button onClick={openModal} color="orange" className="w-[15rem] h-[5rem] text-3xl">
          Cómo Jugar
        </Button>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} color='orange' className='w-[55%]'>
        <Instructions/>
      </Modal>
    </div>
  );
}