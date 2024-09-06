import React, { useState, useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton,
    CForm,
    CFormInput,
    CToaster,
    CToast,
    CToastBody,
    CToastHeader,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';

const Message = () => {
    const [messages, setMessages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [newMessage, setNewMessage] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        content: null,
        file_type: '',
    });

    const [toast, addToast] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch('http://localhost:3001/messages', {
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                console.log(data); // Log the data to check the content and fileType
                setMessages(data);
            })
            .catch((error) => console.error('Error fetching message list:', error));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        addToast(createToast('Your session has timed out. Please log in again.', 'danger'));
        setTimeout(() => {
            navigate('/login');
        }, 3000);
    };
    const handleDotClick = (index) => {
        setCurrentImageIndex(index);
    };
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const file_type = files[0]?.type.startsWith('image/') ? 'image' : files[0]?.type.startsWith('video/') ? 'video' : '';
        setNewMessage({

            ...newMessage,
            content: files, // Set multiple files
            file_type,
        });
    };
    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMessage({
            ...newMessage,
            [name]: value,
        });
    };

    const handleAddMessage = (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const formData = new FormData();
        formData.append('title', newMessage.title);
        formData.append('description', newMessage.description);
        formData.append('start_date', newMessage.start_date);
        formData.append('end_date', newMessage.end_date);
        formData.append('file_type', newMessage.file_type);
        for (let i = 0; i < newMessage.content.length; i++) {
            formData.append('content', newMessage.content[i]);
        }

        const url = editMode ? `http://localhost:3001/messages/${newMessage.id}` : 'http://localhost:3001/messages/add';
        const method = editMode ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                Authorization: token,
            },
            body: formData,
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                if (data) {
                    const updatedMessages = editMode
                        ? messages.map((message) => (message.id === newMessage.id ? { ...message, ...newMessage } : message))
                        : [...messages, data.message];
                    setMessages(updatedMessages);
                    setNewMessage({
                        title: '',
                        description: '',
                        start_date: '',
                        end_date: '',
                        file_type: '',
                        content: null,
                    });
                    setShowModal(false);
                    setEditMode(false);
                    addToast(createToast('Message saved successfully', 'success'));
                }
            })
            .catch((error) => console.error('Error adding message:', error));
    };

    const handleEdit = (message) => {
        setNewMessage(message);
        setShowModal(true);
        setEditMode(true);
    };

    const handleDelete = (id) => {
        const token = localStorage.getItem('token');

        fetch(`http://localhost:3001/messages/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    handleLogout();
                    throw new Error('Unauthorized');
                }
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(() => {
                setMessages(messages.filter((message) => message.id !== id));
                addToast(createToast('Message deleted successfully', 'success'));
            })
            .catch((error) => console.error('Error deleting message:', error));
    };

    const createToast = (message, color) => (
        <CToast autohide={true} delay={3000} color={color}>
            <CToastHeader closeButton>{message}</CToastHeader>
            <CToastBody>{message}</CToastBody>
        </CToast>
    );

    return (
        <CCard>
            <CModal visible={showImageModal} onClose={() => setShowImageModal(false)} size="lg">
                <CModalBody className="text-center">
                    <img src={`http://localhost:3001/uploads/${selectedImage}`} alt="Enlarged" style={{ width: '100%' }} />
                </CModalBody>
            </CModal>
            <CCardHeader>
                Message List
                <CButton color="primary" className="float-end" onClick={() => setShowModal(!showModal)}>
                    {showModal ? 'Cancel' : 'Add Message'}
                </CButton>
            </CCardHeader>
            <CCardBody>
                <CTable striped hover>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>ID</CTableHeaderCell>
                            <CTableHeaderCell>Title</CTableHeaderCell>
                            <CTableHeaderCell>Description</CTableHeaderCell>
                            <CTableHeaderCell>Start Date</CTableHeaderCell>
                            <CTableHeaderCell>End Date</CTableHeaderCell>
                            <CTableHeaderCell>File Type</CTableHeaderCell>
                            <CTableHeaderCell>Content</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                            <CTableHeaderCell>Created At</CTableHeaderCell>
                            <CTableHeaderCell>Updated At</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {messages.map((message, index) => (
                            <CTableRow key={index}>
                                <CTableDataCell>{message.id}</CTableDataCell>
                                <CTableDataCell>{message.title}</CTableDataCell>
                                <CTableDataCell>{message.description}</CTableDataCell>
                                <CTableDataCell>{message.start_date}</CTableDataCell>
                                <CTableDataCell>{message.end_date}</CTableDataCell>
                                <CTableDataCell>{message.file_type}</CTableDataCell>
                                <CTableDataCell>
                                    {message.file_type === 'image' && Array.isArray(message.content) ? (
                                        <div>
                                            <img
                                                src={`http://localhost:3001/uploads/${message.content[currentImageIndex]}`}
                                                alt={message.title}
                                                style={{ width: '100px', cursor: 'pointer' }}
                                                onClick={() => handleImageClick(message.content[currentImageIndex])}
                                            />
                                            <div className="dots-container">
                                                {message.content.map((_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                                        onClick={() => handleDotClick(index)}
                                                        style={{
                                                            height: '10px',
                                                            width: '10px',
                                                            margin: '0 5px',
                                                            backgroundColor: index === currentImageIndex ? '#000' : '#bbb',
                                                            borderRadius: '50%',
                                                            display: 'inline-block',
                                                            cursor: 'pointer',
                                                        }}
                                                    ></span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <span>Unsupported file type</span>
                                    )}
                                </CTableDataCell>

                                <CTableDataCell>
                                    <CButton color="info" size="sm" onClick={() => handleEdit(message)}>
                                        <CIcon icon={cilPencil} />
                                    </CButton>{' '}
                                    <CButton color="danger" size="sm" onClick={() => handleDelete(message.id)}>
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </CTableDataCell>
                                <CTableDataCell>{new Date(message.created_at).toLocaleString()}</CTableDataCell>
                                <CTableDataCell>{new Date(message.updated_at).toLocaleString()}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </CCardBody>
            <CToaster position="top-right">{toast}</CToaster>

            <CModal visible={showModal} onClose={() => setShowModal(false)}>
                <CModalHeader onClose={() => setShowModal(false)}>
                    <CModalTitle>{editMode ? 'Edit Message' : 'Add Message'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CForm>
                        <CFormInput
                            type="text"
                            name="title"
                            placeholder="Title"
                            value={newMessage.title || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="description"
                            placeholder="Description"
                            value={newMessage.description || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="date"
                            name="start_date"
                            placeholder="Start Date"
                            value={newMessage.start_date || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="date"
                            name="end_date"
                            placeholder="End Date"
                            value={newMessage.end_date || ''}
                            onChange={handleInputChange}
                            className="mb-3"
                        />
                        <CFormInput
                            type="file"
                            name="content"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            multiple
                            className="mb-3"
                        />
                        <CFormInput
                            type="text"
                            name="file_type"
                            placeholder="File Type"
                            value={newMessage.file_type || ''}
                            readOnly
                            className="mb-3"
                        />
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </CButton>
                    <CButton color="success" onClick={handleAddMessage}>
                        Save Message
                    </CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    );
}

export default Message;
