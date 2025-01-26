'use client';

import Button from '@/components/button/button';
import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { useAuth } from '@/context/authcontext';

export default function MenuPage() {
  const {logout} = useAuth();

  return (
    <section className="min-h-[100vh] flex flex-col gap-12">

      {/* Encabezado */}
      <Header />

      <section className='w-5/6 text-xl mx-auto'>Orbito es un emocionante juego de mesa tridimensional que desafía la lógica y la visión espacial de los jugadores. Con un diseño innovador y bolas de colores vibrantes, ofrece una experiencia única que combina estrategia y diversión. Perfecto para todas las edades, Orbito garantiza momentos de competencia amigable mientras pone a prueba tu capacidad para anticiparte y planificar en múltiples dimensiones.</section>

      {/* Botonera */}
      <section className="flex justify-center gap-[5rem] select-none">
        <Button onClick={logout} color="orange" className="w-[15rem] h-[5rem] text-3xl">
          Logout
        </Button>
      </section>
      <Footer/>
    </section>
  );
}