// import React, { useState,useContext} from 'react'
// import {Link,useLocation} from 'react-router-dom'
// import Logo from '../images/images/logo.png'
// import {FaBars} from 'react-icons/fa'
// import {AiOutlineClose} from 'react-icons/ai'
// import { UserContext } from '../context/userContext'

// const Header = () => {
 
//  const [isNavShowing,setIsNavShowing]=useState(window.innerWidth>800?true:false)

// const {currentUser}=useContext(UserContext);
// const location=useLocation();
// const isAdminPath=location.pathname.startsWith('/admin');


// const closeNavHandler=()=>
// {
//   if(window.innerWidth<800)
//   {
//     setIsNavShowing(false);
    
//   }
//   else 
//   {
//     setIsNavShowing(true)
//   }
  
// };

 
 
//   return (

//     <nav>
//     <div className="container nav__container">
//     <Link to='/' className='nav__logo' onClick={closeNavHandler}>
// <img src={Logo} alt='Navbar Logo'/>
//     </Link>

//     {currentUser?.id && isNavShowing && <ul className="nav__menu">
//     <li><Link to={`/profile/${currentUser.id}`} onClick={closeNavHandler}>{currentUser?.name}</Link></li>
//     <li><Link to='/create' onClick={closeNavHandler}>Create Post</Link></li>
//     <li><Link to='/authors' onClick={closeNavHandler}>Authors</Link></li>
//     <li><Link to='/logout' onClick={closeNavHandler}>Logout</Link></li>
//     </ul>}
//     {!currentUser?.id && isNavShowing && <ul className="nav__menu">
//     <li><Link to='/authors' onClick={closeNavHandler}>Authors</Link></li>
//     <li><Link to='/login' onClick={closeNavHandler}>Login</Link></li>
//     </ul>}
//     <button className="nav__toggle-btn" onClick={()=>setIsNavShowing(!isNavShowing)}>
//     {isNavShowing ? <AiOutlineClose/>:<FaBars/>}
//     {/* <AiOutlineClose/> */}
//     {/* <FaBars/> */}
//     </button>
// </div>
// </nav>
//   )
// }

// export default Header


import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../images/images/logo.png';
import { FaBars } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';
import { UserContext } from '../context/userContext';
import { AdminContext } from '../context/adminContext';

const Header = () => {
  const [isNavShowing, setIsNavShowing] = useState(window.innerWidth > 800);
  const { currentUser } = useContext(UserContext);
  const { isAdmin } = useContext(AdminContext);
  const location = useLocation();
  const [isAdminPage, setIsAdminPage] = useState(false);

  useEffect(() => {
    // Check if the current path is an admin page
    setIsAdminPage(location.pathname.startsWith('/admin'));
  }, [location]);

  const closeNavHandler = () => {
    if (window.innerWidth < 800) {
      setIsNavShowing(false);
    } else {
      setIsNavShowing(true);
    }
  };

  return (
    <nav>
      <div className="container nav__container">
        <Link to='/' className='nav__logo' onClick={closeNavHandler}>
          <img src={Logo} alt='Navbar Logo' />
        </Link>

        {isNavShowing && (
          <ul className="nav__menu">
            {currentUser?.id && !isAdminPage && (
              <>
                <li><Link to={`/profile/${currentUser.id}`} onClick={closeNavHandler}>{currentUser?.name}</Link></li>
                {/* "Create Post" link is hidden on admin pages */}
                <li><Link to='/create' onClick={closeNavHandler}>Create Post</Link></li>
              </>
            )}
            <li><Link to='/authors' onClick={closeNavHandler}>Authors</Link></li>
            {currentUser?.id ? (
              <li><Link to='/logout' onClick={closeNavHandler}>Logout</Link></li>
            ) : !isAdminPage && (
              <li><Link to='/login' onClick={closeNavHandler}>Login</Link></li>
            )}
          </ul>
        )}

        <button className="nav__toggle-btn" onClick={() => setIsNavShowing(!isNavShowing)}>
          {isNavShowing ? <AiOutlineClose /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};

export default Header;

