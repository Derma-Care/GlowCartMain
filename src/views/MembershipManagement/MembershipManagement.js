import React, { useState } from 'react'
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CBadge,
  CButton,
  CRow,
  CCol,
} from '@coreui/react'

const MembershipManagement = () => {
  const [activeKey, setActiveKey] = useState(1)

  const sampleMembers = [
    { id: 1, name: 'John Doe', membership: 'Gold', expiry: '2025-12-31', status: 'Active' },
    { id: 2, name: 'Jane Smith', membership: 'Silver', expiry: '2025-08-15', status: 'Expired' },
    { id: 3, name: 'Rahul Kumar', membership: 'Platinum', expiry: '2025-11-20', status: 'Active' },
    { id: 4, name: 'Ayesha Khan', membership: 'Silver', expiry: '2025-10-10', status: 'Pending' },
  ]

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Expired':
        return 'danger'
      case 'Pending':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const renderTable = (statusFilter) => {
    const filtered = sampleMembers.filter((member) => member.status === statusFilter)
    return (
      <CTable striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>S.No</CTableHeaderCell>
            <CTableHeaderCell>Member Name</CTableHeaderCell>
            <CTableHeaderCell>Membership Type</CTableHeaderCell>
            <CTableHeaderCell>Expiry Date</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {filtered.length > 0 ? (
            filtered.map((member, index) => (
              <CTableRow key={member.id}>
                <CTableDataCell>{index + 1}</CTableDataCell>
                <CTableDataCell>{member.name}</CTableDataCell>
                <CTableDataCell>{member.membership}</CTableDataCell>
                <CTableDataCell>{member.expiry}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={getBadgeColor(member.status)}>{member.status}</CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-center">
                  <CButton color="info" size="sm">
                    View/Edit
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="6" className="text-center text-muted">
                No records found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
    )
  }

  return (
    <CCard className="shadow-sm border-light">
      <CCardBody>
        <h4 className="text-primary fw-bold mb-4 text-center">Membership Management</h4>

        <CRow className="mb-3 text-center">
          <CCol md={4}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Total Members</h6>
              <h5 className="fw-bold text-primary">{sampleMembers.length}</h5>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Active</h6>
              <h5 className="fw-bold text-success">
                {sampleMembers.filter((m) => m.status === 'Active').length}
              </h5>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="bg-light shadow-sm p-3 border-0">
              <h6>Expired</h6>
              <h5 className="fw-bold text-danger">
                {sampleMembers.filter((m) => m.status === 'Expired').length}
              </h5>
            </CCard>
          </CCol>
        </CRow>

        <CNav variant="tabs" role="tablist" className="mb-3">
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
              Active
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
              Expired
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
              Pending
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible={activeKey === 1}>{renderTable('Active')}</CTabPane>
          <CTabPane visible={activeKey === 2}>{renderTable('Expired')}</CTabPane>
          <CTabPane visible={activeKey === 3}>{renderTable('Pending')}</CTabPane>
        </CTabContent>
      </CCardBody>
    </CCard>
  )
}

export default MembershipManagement
