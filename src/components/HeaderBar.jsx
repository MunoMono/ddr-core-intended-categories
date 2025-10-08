import { Header, HeaderName, HeaderGlobalBar } from '@carbon/react';
import { Link } from 'react-router-dom';

function HeaderBar() {
  return (
    <Header aria-label="RCA DDR Core Intended Categories">
      <HeaderName as={Link} to="/" prefix="RCA DDR">
        Core Intended Categories
      </HeaderName>
      <HeaderGlobalBar />
    </Header>
  );
}

export default HeaderBar;
