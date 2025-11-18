import React, { useEffect, useState } from 'react'
import {
  CFormInput,
  CFormSelect,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CCard,
  CCardHeader,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { postSubService, getAllSubServices, deleteSubServiceData } from './ProcedureAPI'
import LoadingIndicator from '../../Utils/loader'
import { ConfirmationModal } from '../../Utils/ConfirmationDelete'
import { Edit2, Eye, Trash2 } from 'lucide-react'
import { COLORS } from '../../Constant/Themes'

const ProcedureManagement = () => {
  const [subServices, setSubServices] = useState([])
  const [subServiceInput, setSubServiceInput] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editSubServiceId, setEditSubServiceId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteServiceId, setDeleteServiceId] = useState(null)
  const [errors, setErrors] = useState({ subService: '' })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  useEffect(() => {
    fetchSubServices()
  }, [])

  const fetchSubServices = async () => {
    setLoading(true)
    try {
      const result = await getAllSubServices()

      const formatted = result.flatMap((category) =>
        Array.isArray(category.subServices)
          ? category.subServices.map((sub) => ({
            id: sub.subServiceId,
            name: sub.subServiceName,
          }))
          : []
      )

      setSubServices(formatted)
    } catch (err) {
      setError('Failed to fetch procedures')
      console.error(err)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    const trimmedInput = subServiceInput.trim()
    if (!trimmedInput) {
      setErrors({ subService: 'Procedure name is required' })
      return
    }

    const duplicate = subServices.some(
      (s) => s.name.toLowerCase() === trimmedInput.toLowerCase() && s.id !== editSubServiceId
    )
    if (duplicate) {
      setErrors({ subService: 'Procedure already exists' })
      return
    }

    try {
      const payload = { subServices: [{ subServiceName: trimmedInput }] }

      const res = editMode
        ? await postSubService(payload, editSubServiceId)
        : await postSubService(payload)

      if (res?.data?.success) {
        toast.success(editMode ? 'Procedure updated successfully' : 'Procedure added successfully')
        fetchSubServices()
        setSubServiceInput('')
        setErrors({ subService: '' })
        setEditMode(false)
        setEditSubServiceId(null)
        setShowModal(false)
      } else {
        toast.error(res?.data?.message || 'Failed to save procedure')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save procedure')
    }
  }

  const handleEdit = (procedure) => {
    setEditMode(true)
    setEditSubServiceId(procedure.id)
    setSubServiceInput(procedure.name)
    setShowModal(true)
  }

  const handleView = (procedure) => {
    setSelectedProcedure(procedure)
    setViewModal(true)
  }

  const confirmDelete = (id) => {
    setDeleteServiceId(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteSubServiceData(deleteServiceId)
      toast.success('Procedure deleted successfully')
      fetchSubServices()
    } catch (err) {
      toast.error('Failed to delete procedure')
    }
    setShowDeleteModal(false)
    setDeleteServiceId(null)
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = subServices.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(subServices.length / itemsPerPage)

  return (
    <>
      <ToastContainer />

      <CCard className="mt-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0" style={{ color: COLORS.black}}>
              Procedure Management
            </h4>

            <CButton
              color="secondary"
              style={{ backgroundColor: 'var(--color-black)', color: COLORS.white }}
              onClick={() => {
                setEditMode(false)
                setSubServiceInput('')
                setShowModal(true)
              }}
            >
              + Add New Procedure
            </CButton>
          </div>
        </CCardHeader>

        {loading ? (
          <LoadingIndicator message="Fetching Procedure Details, Please wait..." />
        ) : error ? (
          <div>{error}</div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead className="pink-table">
              <CTableRow>
                <CTableHeaderCell>S.No</CTableHeaderCell>
                <CTableHeaderCell>Procedure</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody className="pink-table">
              {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <CTableRow key={row.id}>
                    <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                    <CTableDataCell>{row.name}</CTableDataCell>

                    <CTableDataCell className="text-center">
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <button className="actionBtn" onClick={() => handleView(row)} title="View">
                          <Eye size={18} />
                        </button>

                        <button className="actionBtn" onClick={() => handleEdit(row)} title="Edit">
                          <Edit2 size={18} />
                        </button>

                        <button
                          className="actionBtn"
                          onClick={() => confirmDelete(row.id)}
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
                  <CTableDataCell colSpan={3} className="text-center">
                    No records found
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}

        {/* Pagination */}
        {subServices.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-3 px-3 pb-3">
            <div>
              <label className="me-2">Rows per page:</label>
              <CFormSelect
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{ width: '80px', display: 'inline-block' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </CFormSelect>
            </div>

            <div>
              <div>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, subServices.length)} of{' '}
                {subServices.length} entries
              </div>

              <CPagination align="end">
                <CPaginationItem
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </CPaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <CPaginationItem
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </CPaginationItem>
                ))}

                <CPaginationItem
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </CPaginationItem>
              </CPagination>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        <CModal visible={showModal} onClose={() => setShowModal(false)}>
          <CModalHeader closeButton>
            <CModalTitle>{editMode ? 'Edit Procedure' : 'Add New Procedure'}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CFormInput
              placeholder="Enter Procedure"
              value={subServiceInput}
              onChange={(e) => {
                setSubServiceInput(e.target.value)
                if (e.target.value.trim()) setErrors({ subService: '' })
              }}
              invalid={!!errors.subService}
            />
            {errors.subService && <div className="text-danger mt-1">{errors.subService}</div>}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleSubmit}>
              {editMode ? 'Update' : 'Add'}
            </CButton>
          </CModalFooter>
        </CModal>

        {/* View Modal */}
        <CModal visible={viewModal} onClose={() => setViewModal(false)}>
          <CModalHeader closeButton>
            <CModalTitle>Procedure Details</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <p><strong>Procedure ID:</strong> {selectedProcedure?.id}</p>
            <p><strong>Procedure Name:</strong> {selectedProcedure?.name}</p>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setViewModal(false)}>Close</CButton>
          </CModalFooter>
        </CModal>

        {/* Delete Confirmation */}
        {showDeleteModal && (
          <ConfirmationModal
            isVisible={showDeleteModal}
            message="Are you sure you want to delete this procedure?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </CCard>
    </>
  )
}

export default ProcedureManagement
