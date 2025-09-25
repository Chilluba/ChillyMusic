import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';

const Header: React.FC = () => {
  const location = useLocation();
  const linkBaseStyle = 'p-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary dark:focus-visible:ring-dark-accent-primary focus-visible:ring-offset-bg-primary dark:focus-visible:ring-offset-dark-bg-primary';

  const getLinkClassName = (path: string) => {
    return `${linkBaseStyle} ${location.pathname === path || (path === '/' && location.pathname.startsWith('/search')) ? 'text-accent-primary dark:text-dark-accent-primary' : 'text-text-secondary dark:text-dark-text-secondary'} hover:text-accent-primary dark:hover:text-dark-accent-primary`;
  };

  return (
    <header className='flex items-center justify-between h-[60px] px-md bg-bg-primary text-text-primary dark:bg-dark-bg-primary dark:text-dark-text-primary border-b border-border-primary dark:border-dark-border-primary'>
      <Link to='/' aria-label='Home' className='focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary dark:focus-visible:ring-dark-accent-primary rounded-md focus-visible:ring-offset-bg-primary dark:focus-visible:ring-offset-dark-bg-primary'>
        <h1 className='text-h2 font-bold text-accent-primary dark:text-dark-accent-primary'>ChillyMusic</h1>
      </Link>
      <nav className='flex items-center gap-xs sm:gap-sm'> {/* Reduced gap slightly */}
        <Link to='/' aria-label='Search' className={getLinkClassName('/')}> <Icon name='MagnifyingGlass' size={24} /> </Link>
        <Link to='/library' aria-label='Library' className={getLinkClassName('/library')}> <Icon name='Bookmark' size={24} /> </Link>
        <Link to='/settings' aria-label='Settings' className={getLinkClassName('/settings')}> <Icon name='Gear' size={24} /> </Link>
      </nav>
    </header>
  );
};
export default Header;
