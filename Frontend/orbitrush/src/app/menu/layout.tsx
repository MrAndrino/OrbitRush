'use client';

import Footer from '@/components/footer/footer';
import Header from '@/components/header/header';
import Friendbox from '@/components/boxfriend/friendbox';
import UserBox from '@/components/boxuser/userbox';
import NotificationBox from '@/components/boxnotification/notificationbox';
import DualDropdown from '@/components/boxprueba/boxprueba';

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
        <DualDropdown/>
      </section>

      <Footer />
    </section>
  );
}