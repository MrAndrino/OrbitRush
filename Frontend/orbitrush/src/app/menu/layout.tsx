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
        <div className="flex justify-evenly w-[83%] h-[81vh] py-12 px-24 overflow-auto scrollbar-hidden text-center">
          {children}
        </div>

        <div className='w-[17%]'>
          <Friendbox/>
        </div>
        <BoxDual/>
      </section>

      <Footer />
    </section>
  );
}