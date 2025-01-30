'use client';

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import { User } from '@/components/cards/friendcard';
import Friendbox from '@/components/friendbox/friendbox';

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <section className="min-h-[100vh] flex flex-col">

      <Header />

      <section className='flex'>
        <div className="w-[80%] h-[75vh] py-12 px-24 overflow-auto scrollbar-hidden text-center">
          {children}
        </div>

        <div className='w-[20%]'>
          <Friendbox/>
        </div>
      </section>

      <Footer />
    </section>
  );
}