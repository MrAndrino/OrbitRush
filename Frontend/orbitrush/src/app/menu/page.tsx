'use client';

import { useState } from 'react';
import Button from '@/components/button/button';
import Line from '@/components/line/line';
import Modal from '@/components/modal/modal';

export default function MenuPage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
        <Button href="/login" color="blue" className="w-[15rem] h-[5rem] text-3xl">
          ¡Juega Ahora!
        </Button>
        <Button onClick={openModal} color="orange" className="w-[15rem] h-[5rem] text-3xl">
          Cómo Jugar
        </Button>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} color='orange' className='w-[55%]'>
        <div className='flex flex-col gap-12 font-secondary'>
          <p className="text-5xl font-primary">Instrucciones del juego</p>
          <div className='flex flex-col gap-2'>
            <p className="text-3xl font-primary">Objetivo</p>
            <p>En Orbito, dos jugadores compiten por alinear cuatro canicas de su color en una fila horizontal, vertical o diagonal. El desafío está en anticipar los movimientos del oponente y adaptarse a los giros inesperados del tablero.</p>
          </div>

          <div className='flex gap-6'>
            <div className='flex flex-col justify-center gap-2'>
              <p className="text-3xl font-primary">Inicio del Juego</p>
              <p>Al comenzar, el sistema asigna al azar quién juega primero. Cada jugador dispone de un conjunto de canicas de su color y toma turnos para realizar sus movimientos.</p>
            </div>
            <img src='images/placeholder.png' alt='' className='h-40' />
          </div>

          <div className='flex flex-row-reverse gap-6 items-center'>
            <div className='flex flex-col justify-center gap-2'>
              <p className="text-3xl font-primary">Turnos de Juego</p>
              <p>Durante cada turno, el jugador debe realizar dos acciones:<br />
                -Colocar una canica en cualquier celda vacía del tablero de 4x4.<br />
                -Activar el mecanismo &quot;Orbito&quot;, que mueve todas las canicas del tablero en patrones predefinidos, cambiando sus posiciones.</p>
            </div>
            <img src='images/placeholder.png' alt='' className='h-40' />
          </div>

          <div className='flex gap-6'>
            <div className='flex flex-col justify-center gap-2'>
              <p className="text-3xl font-primary">El Tablero Dinámico</p>
              <p>El tablero se actualiza automáticamente cuando se activa el mecanismo &quot;Orbito&quot;. Las canicas del anillo exterior se desplazan en una dirección, mientras que las del anillo interior lo hacen en la dirección opuesta. Este movimiento puede romper alineaciones o crear nuevas oportunidades estratégicas.</p>
            </div>
            <img src='images/placeholder.png' alt='' className='h-40' />
          </div>

          <div className='flex flex-row-reverse gap-6 items-center'>
            <div className='flex flex-col justify-center gap-2'>
              <p className="text-3xl font-primary">Condiciones de Victoria</p>
              <p>El primer jugador que logre alinear cuatro canicas de su color gana la partida. En caso de que no haya más canicas por colocar, se activará el mecanismo &quot;Orbito&quot; 5 veces. Si en ninguno de esos 5 movimientos se consigue alinear 4 canicas, el juego acabará en empate.</p>
            </div>
            <img src='images/placeholder.png' alt='' className='h-40' />
          </div>

          <div className='flex flex-col gap-2'>
            <p className="text-3xl font-primary">¡Hora de jugar!</p>
            <p>Ahora que conoces todas las normas es hora de ponerlo en práctica:<br />
            ¿Serás capaz de vencer a la IA? ¿Serás el mejor entre tus amigos?<br />
            Descúbrelo ahora en Orbit Rush!</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}