import Link from 'next/link';
import Button from '@/components/button/button';

export default function homePage() {
  return (
    <>
      <div className="text-center">
        <div className="relative bg-[url('/images/OrbitRush-Logo.png')] bg-cover bg-center h-64 w-full">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center font-primary text-7xl" >
            Tu nueva forma de jugar Orbito
          </div>
        </div>
        <div>
          <Link href="/login">
            <Button
              variant={"short"}
              color={""}
            > Joder</Button>
          </Link>
        </div>
        <div>
          Reglas
        </div>
      </div>
    </>
  );
}