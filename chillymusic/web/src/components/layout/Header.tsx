import React from 'react';
import Icon from '../ui/Icon'; // Corrected path

const Header: React.FC = () => {
  return (
    <header className='flex items-center justify-between h-[60px] px-md bg-bg-primary border-b border-border-primary'>
      <button aria-label='Menu' className='p-2'>
        <Icon name='List' size={24} className='text-text-primary' />
      </button>
      <h1 className='text-h2 font-bold text-text-primary'>ChillyMusic</h1>
      <div className='flex items-center gap-md'>
        <button aria-label='Toggle theme' className='p-2'>
          <Icon name='Moon' size={24} className='text-text-primary' />
        </button>
        <button aria-label='Settings' className='p-2'>
          <Icon name='Gear' size={24} className='text-text-primary' />
        </button>
      </div>
    </header>
  );
};
export default Header;
