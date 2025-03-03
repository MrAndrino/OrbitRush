'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authcontext';
import Footer from '@/components/mainlayout/footer/footer';
import Header from '@/components/mainlayout/header/header';
import Friendbox from '@/components/mainlayout/userbox/boxfriend/friendbox';
import BoxDual from '@/components/mainlayout/userbox/boxdual/boxdual';

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      console.log("Debes loguear antes");
      router.push('/login');
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <section className="min-h-[100vh] flex flex-col">
      <Header />

      <section className='flex'>
        <div className='w-[17%] z-10'>
          <Friendbox />
        </div>

        <div className="flex justify-center w-[83%] h-[81vh]">
          {children}
        </div>

        <BoxDual />
      </section>

      <Footer />
    </section>
  );
}
