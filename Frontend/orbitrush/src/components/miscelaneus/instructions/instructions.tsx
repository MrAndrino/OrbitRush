function Instructions() {
  return (
    <section className='flex flex-col gap-12 font-secondary'>
      <p className="text-5xl font-primary">Instrucciones del juego</p>
      <section className='flex flex-col gap-2'>
        <p className="text-3xl font-primary">Objetivo</p>
        <p>En Orbito, dos jugadores compiten por alinear cuatro canicas de su color en una fila horizontal, vertical o diagonal. El desafío está en anticipar los movimientos del oponente y adaptarse a los giros inesperados del tablero.</p>
      </section>

      <section className='flex gap-6'>
        <div className='flex flex-col justify-center gap-2'>
          <p className="text-3xl font-primary">Inicio del Juego</p>
          <p>Al comenzar, el sistema asigna al azar quién juega primero. Cada jugador dispone de un conjunto de canicas de su color y toma turnos para realizar sus movimientos.</p>
        </div>
        <img src='/images/Move-Start.png' alt='' className='h-40' />
      </section>

      <section className='flex flex-row-reverse gap-6 items-center'>
        <div className='flex flex-col justify-center gap-2'>
          <p className="text-3xl font-primary">Turnos de Juego</p>
          <p>Durante cada turno, el jugador debe realizar dos acciones:<br />
            -Colocar una canica en cualquier celda vacía del tablero de 4x4.<br />
            -Activar el mecanismo &quot;Orbito&quot;, que mueve todas las canicas del tablero en patrones predefinidos, cambiando sus posiciones.</p>
        </div>
        <img src='/images/Move-Token.png' alt='' className='h-40' />
      </section>

      <section className='flex gap-6'>
        <div className='flex flex-col justify-center gap-2'>
          <p className="text-3xl font-primary">El Tablero Dinámico</p>
          <p>El tablero se actualiza automáticamente cuando se activa el mecanismo &quot;Orbito&quot;. Las canicas del anillo exterior se desplazan en una dirección, mientras que las del anillo interior lo hacen en la dirección opuesta. Este movimiento puede romper alineaciones o crear nuevas oportunidades estratégicas.</p>
        </div>
        <img src='/images/Move-Orbit.png' alt='' className='h-40' />
      </section>

      <section className='flex flex-row-reverse gap-6 items-center'>
        <div className='flex flex-col justify-center gap-2'>
          <p className="text-3xl font-primary">Condiciones de Victoria</p>
          <p>El primer jugador que logre alinear cuatro canicas de su color gana la partida. En caso de que no haya más canicas por colocar, se activará el mecanismo &quot;Orbito&quot; 5 veces. Si en ninguno de esos 5 movimientos se consigue alinear 4 canicas, el juego acabará en empate.</p>
        </div>
        <img src='/images/Move-Win.png' alt='' className='h-40' />
      </section>

      <section className='flex flex-col gap-2'>
        <p className="text-3xl font-primary">¡Hora de jugar!</p>
        <p>Ahora que conoces todas las normas es hora de ponerlo en práctica:<br />
          ¿Serás capaz de vencer a la IA? ¿Serás el mejor entre tus amigos?<br />
          Descúbrelo ahora en Orbit Rush!</p>
      </section>
    </section>
  )
}

export default Instructions;