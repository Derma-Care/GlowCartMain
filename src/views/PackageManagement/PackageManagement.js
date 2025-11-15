// PackageManagement.jsx
import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CBadge,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import { COLORS } from '../../Constant/Themes'

/**
 * PackageManagement
 *
 * - Tabs: Active / Inactive / Expired
 * - Table with S.No, pagination, actions (view/edit/delete)
 * - Add/Edit modal, View modal, Delete confirmation modal
 * - Toast notifications
 *
 * NOTE: If you have your own LoadingIndicator or ConfirmationModal components,
 * replace the fallback ones below with imports.
 */

/* ---------- Fallback LoadingIndicator ---------- */
const LoadingIndicatorFallback = ({ message = 'Loading...' }) => (
  <div className="p-4 text-center text-muted">{message}</div>
)

/* ---------- Fallback Confirmation Modal ---------- */
const ConfirmationModalFallback = ({ visible, message, onConfirm, onCancel }) => {
  return (
    <CModal visible={visible} onClose={onCancel}>
      <CModalHeader>
        <CModalTitle>Confirm</CModalTitle>
      </CModalHeader>
      <CModalBody>{message}</CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onCancel}>
          Cancel
        </CButton>
        <CButton color="danger" onClick={onConfirm}>
          Delete
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

/* ---------- Helper: badge color by status ---------- */
const getBadgeColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Inactive':
      return 'secondary'
    case 'Expired':
      return 'danger'
    default:
      return 'secondary'
  }
}

/* ---------- The Component ---------- */
const PackageManagement = () => {
  // UI state
  const [activeKey, setActiveKey] = useState(1) // 1=Active,2=Inactive,3=Expired

  // Data (initial sample)
  const [packages, setPackages] = useState([
    { id: 1, name: 'Basic Plan', price: '500', duration: '1 Month', status: 'Active' },
    { id: 2, name: 'Premium Plan', price: '1500', duration: '3 Months', status: 'Inactive' },
    { id: 3, name: 'Gold Plan', price: '5000', duration: '1 Year', status: 'Active' },
    { id: 4, name: 'Platinum Plan', price: '12000', duration: '1 Year', status: 'Expired' },
    // add more if you want to test pagination
  ])

  // modal visibility
  const [modalVisible, setModalVisible] = useState(false)
  const [viewModalVisible, setViewModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  // selection & form state
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [form, setForm] = useState({ name: '', price: '', duration: '', status: 'Active' })
  const [errors, setErrors] = useState({})

  // loader & other UI
  const [loading, setLoading] = useState(false)

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // package options for name select (optional)
  const packageOptions = ['Basic Plan', 'Premium Plan', 'Gold Plan', 'Platinum Plan']

  // auto-clear errors after 2s (nice UX)
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const t = setTimeout(() => setErrors({}), 2000)
      return () => clearTimeout(t)
    }
  }, [errors])

  // Helpers for filtering by tab
  const statusForKey = (key) => {
    if (key === 1) return 'Active'
    if (key === 2) return 'Inactive'
    return 'Expired'
  }

  // Validate form
  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim() === '') e.name = 'Package name is required'
    if (!form.price || String(form.price).trim() === '') e.price = 'Price is required'
    // Duration: Accept "1 Month", "3 Months", "1 Year", etc.
    if (!form.duration || form.duration.trim() === '') {
      e.duration = 'Duration is required'
    } else if (!/^\d+\s+(Month|Months|Year|Years)$/.test(form.duration)) {
      e.duration = 'Duration must be like "1 Month", "3 Months", "1 Year"'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // Format duration input on change (normalization)
  const normalizeDuration = (value) => {
    let val = value.trim().replace(/\s+/g, ' ')
    // add missing space: "1month" => "1 month"
    val = val.replace(/^(\d+)([a-zA-Z]+)$/, '$1 $2')
    // Capitalize unit
    val = val.replace(/\b[a-z]/g, (c) => c.toUpperCase())
    const match = val.match(/^(\d+)\s*(Month|Months|Year|Years)?$/i)
    if (match) {
      const num = parseInt(match[1], 10)
      let unit = match[2] ? match[2].toLowerCase() : ''
      if (num === 1) {
        if (unit === 'months' || unit === 'month') unit = 'Month'
        if (unit === 'years' || unit === 'year') unit = 'Year'
      } else {
        if (unit === 'month' || unit === 'months') unit = 'Months'
        if (unit === 'year' || unit === 'years') unit = 'Years'
      }
      val = unit ? `${num} ${unit}` : `${num}`
    }
    return val
  }

  // Add or update package
  const handleAddOrUpdate = (e) => {
    e?.preventDefault?.()
    if (!validate()) return

    // check duplicates (by name)
    const dup = packages.some(
      (p) => p.name.toLowerCase() === form.name.trim().toLowerCase() && (!isEditMode || p.id !== selectedPackage?.id)
    )
    if (dup) {
      setErrors({ name: 'Package with this name already exists' })
      return
    }

    if (isEditMode && selectedPackage) {
      const updated = packages.map((p) =>
        p.id === selectedPackage.id ? { ...p, ...form, price: String(form.price).trim() } : p
      )
      setPackages(updated)
      toast.success('Package updated successfully')
    } else {
      const nextId = packages.length ? packages[packages.length - 1].id + 1 : 1
      setPackages([...packages, { id: nextId, ...form, price: String(form.price).trim() }])
      toast.success('Package added successfully')
    }

    setModalVisible(false)
    setIsEditMode(false)
    setSelectedPackage(null)
    setForm({ name: '', price: '', duration: '', status: 'Active' })
  }

  // prepare edit
  const handleEdit = (pkg) => {
    setIsEditMode(true)
    setSelectedPackage(pkg)
    setForm({ name: pkg.name, price: pkg.price, duration: pkg.duration, status: pkg.status })
    setModalVisible(true)
  }

  // view
  const handleView = (pkg) => {
    setSelectedPackage(pkg)
    setViewModalVisible(true)
  }

  // delete flow
  const [toDeleteId, setToDeleteId] = useState(null)
  const handleDeleteRequest = (id) => {
    setToDeleteId(id)
    setDeleteModalVisible(true)
  }
  const confirmDelete = () => {
    if (toDeleteId == null) return
    setPackages(packages.filter((p) => p.id !== toDeleteId))
    toast.success('Package deleted successfully')
    setToDeleteId(null)
    setDeleteModalVisible(false)
    // Adjust current page if needed
    const totalAfter = packages.length - 1
    const totalPagesAfter = Math.max(1, Math.ceil(totalAfter / itemsPerPage))
    if (currentPage > totalPagesAfter) setCurrentPage(totalPagesAfter)
  }

  // Derived: filtered packages for active tab
  const filteredPackages = packages.filter((p) => p.status === statusForKey(activeKey))

  // Pagination derived values
  const indexOfLast = currentPage * itemsPerPage
  const indexOfFirst = indexOfLast - itemsPerPage
  const currentItems = filteredPackages.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / itemsPerPage))


  return (
    <CCard className="shadow-sm border-light">
      <ToastContainer position="top-right" />
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Package Management</h4>
 
          <CButton
            style={{ backgroundColor: COLORS.black, color: 'white' }}
            onClick={() => {
              setIsEditMode(false)
              setSelectedPackage(null)
              setForm({ name: '', price: '', duration: '', status: 'Active' })
              setModalVisible(true)
            }}
          >
            + Add Package
          </CButton>
    
      </CCardHeader>

      <CCardBody>
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink active={activeKey === 1} onClick={() => { setActiveKey(1); setCurrentPage(1) }}>
              Active
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 2} onClick={() => { setActiveKey(2); setCurrentPage(1) }}>
              Inactive
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeKey === 3} onClick={() => { setActiveKey(3); setCurrentPage(1) }}>
              Expired
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          <CTabPane visible={activeKey === 1}>
            {/* Table */}
            {loading ? (
              <LoadingIndicatorFallback message="Fetching packages..." />
            ) : (
              <div>
                <CTable striped hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>S.No</CTableHeaderCell>
                      <CTableHeaderCell>Package Name</CTableHeaderCell>
                      <CTableHeaderCell>Price (₹)</CTableHeaderCell>
                      <CTableHeaderCell>Duration</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentItems.length > 0 ? (
                      currentItems.map((pkg, idx) => (
                        <CTableRow key={pkg.id}>
                          <CTableDataCell>{indexOfFirst + idx + 1}</CTableDataCell>
                          <CTableDataCell>{pkg.name}</CTableDataCell>
                          <CTableDataCell>₹{pkg.price}</CTableDataCell>
                          <CTableDataCell>{pkg.duration}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getBadgeColor(pkg.status)}>{pkg.status}</CBadge>
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                              <button
                               className="actionBtn"
                                onClick={() => handleView(pkg)}
                                title="View"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                className="actionBtn"
                                onClick={() => handleEdit(pkg)}
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                className="actionBtn"
                                onClick={() => handleDeleteRequest(pkg.id)}
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={6} className="text-center text-muted">
                          No records found
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>

                {/* Pagination and rows per page */}
                {filteredPackages.length > 0 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      <span className="me-2">Rows per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                      </select>
                    </div>

                    <div>
                      <span className="me-3">
                        Showing {filteredPackages.length === 0 ? 0 : indexOfFirst + 1} to{' '}
                        {Math.min(indexOfLast, filteredPackages.length)} of {filteredPackages.length} entries
                      </span>
                      <CPagination aria-label="Package pagination">
                        <CPaginationItem
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </CPaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <CPaginationItem
                            key={i}
                            active={i + 1 === currentPage}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        ))}
                        <CPaginationItem
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </CPaginationItem>
                      </CPagination>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CTabPane>

          {/* Inactive Tab */}
          <CTabPane visible={activeKey === 2}>
            {/* Reuse the same table for inactive */}
            {/* To avoid duplication, simply render the same structure but with activeKey controlling filteredPackages */}
            {/* We'll reuse the rendering by flipping activeKey; so no need to duplicate JSX here.
                For simplicity, rerender the same block by temporarily setting activeKey to 2 or 3 - but since
                filteredPackages is derived from activeKey, it will show correct rows. */}
            {/* Re-render the same table block by copying above content */}
            <div>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Package Name</CTableHeaderCell>
                    <CTableHeaderCell>Price (₹)</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((pkg, idx) => (
                      <CTableRow key={pkg.id}>
                        <CTableDataCell>{indexOfFirst + idx + 1}</CTableDataCell>
                        <CTableDataCell>{pkg.name}</CTableDataCell>
                        <CTableDataCell>₹{pkg.price}</CTableDataCell>
                        <CTableDataCell>{pkg.duration}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getBadgeColor(pkg.status)}>{pkg.status}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <button className="actionBtn" onClick={() => handleView(pkg)} title="View">
                              <Eye size={18} />
                            </button>
                            <button className="actionBtn" onClick={() => handleEdit(pkg)} title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button className="actionBtn" onClick={() => handleDeleteRequest(pkg.id)} title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center text-muted">
                        No records found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {filteredPackages.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="me-2">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </div>

                  <div>
                    <span className="me-3">
                      Showing {filteredPackages.length === 0 ? 0 : indexOfFirst + 1} to{' '}
                      {Math.min(indexOfLast, filteredPackages.length)} of {filteredPackages.length} entries
                    </span>
                    <CPagination aria-label="Package pagination">
                      <CPaginationItem
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </div>
              )}
            </div>
          </CTabPane>

          {/* Expired Tab */}
          <CTabPane visible={activeKey === 3}>
            <div>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>S.No</CTableHeaderCell>
                    <CTableHeaderCell>Package Name</CTableHeaderCell>
                    <CTableHeaderCell>Price (₹)</CTableHeaderCell>
                    <CTableHeaderCell>Duration</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((pkg, idx) => (
                      <CTableRow key={pkg.id}>
                        <CTableDataCell>{indexOfFirst + idx + 1}</CTableDataCell>
                        <CTableDataCell>{pkg.name}</CTableDataCell>
                        <CTableDataCell>₹{pkg.price}</CTableDataCell>
                        <CTableDataCell>{pkg.duration}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={getBadgeColor(pkg.status)}>{pkg.status}</CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <button className="actionBtn" onClick={() => handleView(pkg)} title="View">
                              <Eye size={18} />
                            </button>
                            <button className="actionBtn" onClick={() => handleEdit(pkg)} title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button className="actionBtn" onClick={() => handleDeleteRequest(pkg.id)} title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan={6} className="text-center text-muted">
                        No records found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>

              {filteredPackages.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="me-2">Rows per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </div>

                  <div>
                    <span className="me-3">
                      Showing {filteredPackages.length === 0 ? 0 : indexOfFirst + 1} to{' '}
                      {Math.min(indexOfLast, filteredPackages.length)} of {filteredPackages.length} entries
                    </span>
                    <CPagination aria-label="Package pagination">
                      <CPaginationItem
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                </div>
              )}
            </div>
          </CTabPane>
        </CTabContent>

        {/* Add/Edit Modal */}
        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="md">
          <CModalHeader>
            <CModalTitle>{isEditMode ? 'Edit Package' : 'Add Package'}</CModalTitle>
          </CModalHeader>
          <form onSubmit={handleAddOrUpdate}>
            <CModalBody>
              <CRow className="g-3">
                <CCol md={12}>
                  <CFormSelect
                    label="Package Name"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    invalid={!!errors.name}
                  >
                    <option value="">Select package</option>
                    {packageOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {/* allow custom name */}
                    <option value="__custom">-- Custom --</option>
                  </CFormSelect>
                  {form.name === '__custom' && (
                    <CFormInput
                      className="mt-2"
                      placeholder="Enter custom package name"
                      value={form.name === '__custom' ? '' : form.name}
                      onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    />
                  )}
                  {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    label="Price"
                    value={form.price}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^0-9]/g, '')
                      setForm((s) => ({ ...s, price: clean }))
                    }}
                    invalid={!!errors.price}
                  />
                  {errors.price && <div className="text-danger mt-1">{errors.price}</div>}
                </CCol>

                <CCol md={6}>
                  <CFormInput
                    label="Duration (ex: 1 Month)"
                    value={form.duration}
                    onChange={(e) => {
                      const normalized = normalizeDuration(e.target.value)
                      setForm((s) => ({ ...s, duration: normalized }))
                    }}
                    invalid={!!errors.duration}
                  />
                  {errors.duration && <div className="text-danger mt-1">{errors.duration}</div>}
                </CCol>

                <CCol md={12}>
                  <CFormSelect
                    label="Status"
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Expired</option>
                  </CFormSelect>
                </CCol>
              </CRow>
            </CModalBody>

            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => {
                  setModalVisible(false)
                  setIsEditMode(false)
                  setSelectedPackage(null)
                }}
              >
                Cancel
              </CButton>
              <CButton color="primary" type="submit">
                {isEditMode ? 'Update' : 'Add'}
              </CButton>
            </CModalFooter>
          </form>
        </CModal>

        {/* View Modal */}
        <CModal visible={viewModalVisible} onClose={() => setViewModalVisible(false)}>
          <CModalHeader>
            <CModalTitle>Package Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {selectedPackage ? (
              <div>
                <p>
                  <strong>ID:</strong> {selectedPackage.id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedPackage.name}
                </p>
                <p>
                  <strong>Price:</strong> ₹{selectedPackage.price}
                </p>
                <p>
                  <strong>Duration:</strong> {selectedPackage.duration}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <CBadge color={getBadgeColor(selectedPackage.status)}>{selectedPackage.status}</CBadge>
                </p>
              </div>
            ) : (
              <div className="text-muted">No package selected</div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModalVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Confirmation */}
        <ConfirmationModalFallback
          visible={deleteModalVisible}
          message="Are you sure you want to delete this package?"
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteModalVisible(false)
            setToDeleteId(null)
          }}
        />
      </CCardBody>
    </CCard>
  )
}

export default PackageManagement
