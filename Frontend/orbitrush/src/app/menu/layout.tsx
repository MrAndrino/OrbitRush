'use client';

import Footer from '@/components/mainlayout/footer/footer';
import Header from '@/components/mainlayout/header/header';
import Friendbox from '@/components/mainlayout/userbox/boxfriend/friendbox';
import BoxDual from '@/components/mainlayout/userbox/boxdual/boxdual';

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <section className="min-h-[100vh] flex flex-col">
      <Header />

      <section className='flex'>
        <div className='w-[15%] z-10'>
          <Friendbox />
        </div>

        <div className="flex justify-center w-[85%] h-[81vh] pr-12">
          {children}
        </div>

        <BoxDual />
      </section>

      <Footer />
    </section>
  );
}