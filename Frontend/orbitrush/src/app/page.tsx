import Link from 'next/link';
import Button from '@/components/button/button';
import Line from '@/components/line/line';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 text-center">
      
      {/* Encabezado */}
      <div className="relative bg-[url('/images/OrbitRush-Logo.png')] bg-cover bg-center">
        <div className="aspect-[8/1]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            Tu nueva forma de jugar Orbito
          </div>
        </div>
        <Line />
      </div>

      {/* Botón para jugar */}
      <Link href="/login">
        <Button color="blue">¡Juega Ahora!</Button>
      </Link>

      {/* Sección de reglas */}
      <div className="text-lg">Reglas</div>
    </div>
  );
}
