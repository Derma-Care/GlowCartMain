import { element } from 'prop-types'
import React from 'react'
import Payouts from './views/Payouts/Payout'


const Login = React.lazy(() => import('./views/pages/login/Login'))
const serviceManagement = React.lazy(() => import('./views/servicesManagement/serviceManagement'))
const CustomerViewDetails = React.lazy(() => import('./views/customerManagement/CustomerViewDetails'),)
const ClinicManagement = React.lazy(() => import('./views/clinicManagement/ClinicManagement'))
const procedureManagement = React.lazy(() => import('./views/ProcedureManagement/ProcedureManagement'),)
const ClinicManagementDetails = React.lazy(() => import('./views/clinicManagement/ClinicDetails'))
const AddClinic = React.lazy(() => import('./views/clinicManagement/AddClinic'))
const categoryManagement = React.lazy(() => import('./views/categoryManagement/categoryManagement'))
const customerManagement = React.lazy(() => import('./views/customerManagement/CustomerManagement'))
const PatientManagement = React.lazy(() => import('./views/providerManagement/ProviderManagement'))
const PatientViewDetails = React.lazy(() => import('./views/providerManagement/ProviderViewDetails'))
const BranchManagement = React.lazy(() => import('./views/clinicManagement/AddBranchForm'))
const AdsManagement = React.lazy(() => import('./views/AdsManagement/AdsManagement'))
const DoctorDetailsPage = React.lazy(() => import('./views/Doctors/DoctorDetailsPage'))
const MembershipManagement = React.lazy(() => import('./views/MembershipManagement/MembershipManagement'))
const PackageManagement = React.lazy(() => import('./views/PackageManagement/PackageManagement'))
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/login', name: 'Login', element: Login },
  { path: '/category-management', name: 'Category Management', element: categoryManagement },
  { path: '/service-management', name: 'Service Management', element: serviceManagement },
  { path: '/customer-management/:mobileNumber', name: 'Customer View Details', element: CustomerViewDetails, },
  { path: '/customer-management', name: 'Customer Management', element: customerManagement },
  { path: '/procedure-management', name: 'Procedure Management', element: procedureManagement },
  { path: '/clinic-Management', name: 'Clinic Management', element: ClinicManagement },
  { path: '/add-clinic', name: 'Add Clinic', element: AddClinic },
  { path: '/doctor/:doctorId', name: 'Doctor Details', element: DoctorDetailsPage },
  { path: '/patients-management', name: 'Patient Management', element: PatientManagement },
  { path: '/clinic-Management/:hospitalId', name: 'Clinic Details', element: ClinicManagementDetails },
  { path: '/branch-details/:branchId', name: 'Branch Details', element: React.lazy(() => import('./views/clinicManagement/BranchDetails')), },
  { path: '/ads-management', name: 'Ads Management', element: AdsManagement },
  { path: '/payouts', name: 'Payouts', element: Payouts },
  { path: '/provider-management/:id', name: 'Patient View Details', element: PatientViewDetails },
  { path: '/clinicDetails', name: 'ClinicDetails', element: ClinicManagementDetails },
  { path: '/branchManagement', name: 'BranchManagement', element: BranchManagement },
  { path: '/membership-management', name: 'MembershipManagement', element: MembershipManagement },
   { path: '/package-management', name: 'PackageManagement', element: PackageManagement},
]

export default routes
