'use client';

import { useState } from 'react';
import Button from '@/components/miscelaneus/button/button';
import Line from '@/components/miscelaneus/line/line';
import Modal from '@/components/miscelaneus/modal/modal';
import { useAuth } from '@/context/authcontext';
import Instructions from '@/components/miscelaneus/instructions/instructions';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const {token} = useAuth()

  return (
    <section className="flex flex-col gap-[10vh] text-center min-h-[100vh]">

      {/* Encabezado */}
      <section className="relative bg-[url('/images/OrbitRush-Fondo.png')] bg-cover bg-center">
        <div className="h-[45vh] select-none">
          <figure className="absolute inset-0 bg-black/55 backdrop-blur-md flex flex-col items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-5xl">
            <img src='images/OrbitRush-Title.png' alt='' className='h-[12rem]' />
            <p className='pt-[1rem] text-white'>Tu nueva forma de jugar Orbito</p>
          </figure>
        </div>
        <Line />
      </section>

      <section className='w-5/6 text-xl mx-auto'>Orbito es un emocionante juego de mesa tridimensional que desafía la lógica y la visión espacial de los jugadores. Con un diseño innovador y bolas de colores vibrantes, ofrece una experiencia única que combina estrategia y diversión. Perfecto para todas las edades, Orbito garantiza momentos de competencia amigable mientras pone a prueba tu capacidad para anticiparte y planificar en múltiples dimensiones.</section>

      {/* Botonera */}
      <section className="flex justify-center gap-[5rem] select-none">
        <Button href={token ? "/menu" : "/login"} color="orange" className="w-[15rem] h-[5rem] text-3xl">
          ¡Juega Ahora!
        </Button>
        <Button onClick={openModal} color="blue" className="w-[15rem] h-[5rem] text-3xl">
          Cómo Jugar
        </Button>
      </section>

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} color='blue' className='w-[55%]'>
        <Instructions/>
      </Modal>
    </section>
  );
}