import Link from 'next/link';
import Button from '@/components/button/button';
import Line from '@/components/line/line';

export default function homePage() {
  return (
    <>
      <div className="text-center">
        <div className="relative bg-[url('/images/OrbitRush-Logo.png')] bg-cover bg-center aspect-[8/1] w-full select-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center font-primary text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
            Tu nueva forma de jugar Orbito
          </div>
        </div>

        <Line />

        <Link href="/login">
          <Button variant="short" color="">¡Juega Ya!</Button>
        </Link>
    

        <div className="">Reglas</div>
      </div>
    </>
  );
}