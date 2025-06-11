import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

const Header: React.FC = () => {
  return (
    <header className='flex items-center justify-between h-[60px] px-md bg-bg-primary border-b border-border-primary'>
      <div className='flex items-center gap-md'>
        {/* Placeholder for future left-side icon, e.g., Menu */}
        <div style={{width: 24}} />
      </div>
      <Link to="/" className='no-underline'>
        <h1 className='text-h2 font-bold text-text-primary hover:text-accent-primary transition-colors'>ChillyMusic</h1>
      </Link>
      <div className='flex items-center gap-sm'> {/* Using gap-sm for slightly less space if many icons */}
        <Link to="/library" aria-label='Library' className='p-2 text-text-primary hover:text-accent-primary transition-colors'>
          <Icon name='Bookmark' size={24} />
        </Link>
        <Link to="/settings" aria-label='Settings' className='p-2 text-text-primary hover:text-accent-primary transition-colors'>
          <Icon name='Gear' size={24} />
        </Link>
      </div>
    </header>
  );
};
export default Header;
