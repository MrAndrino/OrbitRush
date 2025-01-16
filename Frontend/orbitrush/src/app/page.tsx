'use client';

import { useState } from 'react';
import Button from '@/components/button/button';
import Line from '@/components/line/line';
import Modal from '@/components/modal/modal';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col gap-[10vh] text-center h-[100vh]">

      {/* Encabezado */}
      <div className="relative bg-[url('/images/OrbitRush-Fondo.png')] bg-cover bg-center">
        <div className="h-[45vh] select-none">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-md flex flex-col items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-5xl">
            <img src='images/OrbitRush-Title.png' className='h-[12rem]'></img>
            <p className='pt-[1rem]'>Tu nueva forma de jugar Orbito</p>
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
      <Modal isOpen={isModalOpen} closeModal={closeModal} color='orange' className='max-w-[40%]'>
        <div className='flex flex-col gap-[2rem] font-secondary'>
          <p className="text-5xl font-primary">Instrucciones del juego</p>
          <div className='font-secondary'>
            <p className="text-3xl font-primary">Objetivo</p>
            <p>En Orbito, dos jugadores compiten por alinear cuatro fichas de su color en una fila horizontal, vertical o diagonal. El desafío está en anticipar los movimientos del oponente y adaptarse a los giros inesperados del tablero.</p>
          </div>

          <div className=''>
            <p className="text-3xl font-primary">Inicio del Juego</p>
            <p>Al comenzar, el sistema asigna al azar quién juega primero. Cada jugador dispone de un conjunto de fichas de su color y toma turnos para realizar sus movimientos.</p>
          </div>

          <div className=''>
            <p className="text-3xl font-primary">Turnos de Juego</p>
            <p>Durante cada turno, el jugador puede realizar dos acciones:
              Colocar una ficha en cualquier celda vacía del tablero de 4x4.
              Activar el mecanismo "Orbito", que mueve todas las fichas del tablero en patrones predefinidos, cambiando sus posiciones.</p>
          </div>

          <div className=''>
            <p className="text-3xl font-primary">El Tablero Dinámico</p>
            <p>El tablero se actualiza automáticamente cuando se activa el mecanismo "Orbito". Las fichas del anillo exterior se desplazan en una dirección, mientras que las del anillo interior lo hacen en la dirección opuesta. Este movimiento puede romper alineaciones o crear nuevas oportunidades estratégicas.</p>
          </div>

          <div className=''>
            <p className="text-3xl font-primary">Condiciones de Victoria</p>
            <p>El primer jugador que logre alinear cuatro fichas de su color gana la partida. En caso de que no haya más movimientos posibles y no se haya alcanzado el objetivo, el juego termina en empate.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}