import { Breadcrumb, BreadcrumbItem } from '@carbon/react';
import { Link, useLocation } from 'react-router-dom';

function Crumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  return (
    <Breadcrumb noTrailingSlash>
      <BreadcrumbItem>
        <Link to="/">Home</Link>
      </BreadcrumbItem>
      {parts.map((part, index) => (
        <BreadcrumbItem key={index}>{part}</BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

export default Crumb;
