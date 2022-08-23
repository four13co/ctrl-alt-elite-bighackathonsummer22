import React from 'react';

// components

export default function Auth({ children }) {
  return (
    <>
      <main>
        <section className="relative w-full grid place-items-center min-h-screen ">
          <div className="absolute top-0 w-full h-full bg-gray-50 bg-no-repeat bg-full"></div>
          {children}
        </section>
      </main>
    </>
  );
}
