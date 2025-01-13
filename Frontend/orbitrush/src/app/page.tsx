import Button from '@/components/button/button';
import Line from '@/components/line/line';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 text-center">
      
      {/* Encabezado */}
      <div className="relative bg-[url('/images/OrbitRush-Fondo.png')] bg-cover bg-center">
        <div className="aspect-[8/1] select-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            Orbit Rush! Tu nueva forma de jugar Órbito
          </div>
        </div>
        <Line />
      </div>

      <div className='w-5/6 text-xl mx-auto'>Órbito es un emocionante juego de mesa tridimensional que desafía la lógica y la visión espacial de los jugadores. Con un diseño innovador y bolas de colores vibrantes, ofrece una experiencia única que combina estrategia y diversión. Perfecto para todas las edades, Órbito garantiza momentos de competencia amigable mientras pone a prueba tu capacidad para anticiparte y planificar en múltiples dimensiones.</div>

      {/* Botón para jugar */}
      <div className="flex justify-center">
        <Button href="/login" color="blue" className="w-[15rem] h-[5rem] text-3xl">
          ¡Juega Ahora!
        </Button>
      </div>

      {/* Sección de reglas */}
      <div className="text-lg">Reglas</div>
    </div>
  );
}
