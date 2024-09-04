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
        CFormCheck,
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
        const [newMessage, setNewMessage] = useState({
            title: '',
            content: null,
            enable: false,
            start_date: '',
            end_date: '',
            selectedRooms: []
        });
    
        const [toast, addToast] = useState([]);
        const navigate = useNavigate();
        const [availableRooms, setAvailableRooms] = useState([]);
    
        useEffect(() => {
            const token = localStorage.getItem('token');
            
            if (!token) {
                handleLogout();
                return;
            }
    
            fetch('http://localhost:3001/rooms', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    if (response.status === 401 || response.status === 403) {
                        handleLogout();
                        throw new Error('Unauthorized');
                    }
                    return response.json();
                })
                .then(data => setAvailableRooms(data))
                .catch(error => console.error('Error fetching rooms:', error));
        }, []);
    
        useEffect(() => {
            const token = localStorage.getItem('token');
    
            fetch('http://localhost:3001/messages', {
                headers: {
                    Authorization: `Bearer ${token}`,
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
                .then((data) => setMessages(data))
                .catch((error) => console.error('Error fetching messages:', error));
        }, []);
    
        const handleLogout = () => {
            localStorage.removeItem('token');
            addToast(createToast('Your session has timed out. Please log in again.', 'danger'));
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        };
    
        const handleFileChange = (e) => {
            const file = e.target.files[0];
            setNewMessage({
                ...newMessage,
                content: file,
            });
        };
    
        const handleInputChange = (e) => {
            const { name, value, type, checked } = e.target;
            setNewMessage({
                ...newMessage,
                [name]: type === 'checkbox' ? checked : value,
            });
        };
    
        const handleRoomSelection = (e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
            setNewMessage({
                ...newMessage,
                selectedRooms: selectedOptions
            });
        };
    
        const handleAddMessage = (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
    
            const formData = new FormData();
            formData.append('title', newMessage.title);
            formData.append('start_date', newMessage.start_date);
            formData.append('end_date', newMessage.end_date);
            formData.append('enable', newMessage.enable ? 1 : 0);
            formData.append('rooms', JSON.stringify(newMessage.selectedRooms));
            if (newMessage.content) {
                formData.append('content', newMessage.content);
            }
    
            const url = editMode ? `http://localhost:3001/messages/${newMessage.id}` : 'http://localhost:3001/messages/add';
            const method = editMode ? 'PUT' : 'POST';
    
            fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
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
                    const updatedMessages = editMode
                        ? messages.map((message) => (message.id === newMessage.id ? { ...message, ...newMessage } : message))
                        : [...messages, data.message];
                    setMessages(updatedMessages);
                    setNewMessage({
                        title: '',
                        content: null,
                        start_date: '',
                        end_date: '',
                        enable: false,
                        selectedRooms: []
                    });
                    setShowModal(false);
                    setEditMode(false);
                    addToast(createToast('Message saved successfully', 'success'));
                })
                .catch((error) => console.error('Error saving message:', error));
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
                    Authorization: `Bearer ${token}`,
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
                                <CTableHeaderCell>Content</CTableHeaderCell>
                                <CTableHeaderCell>Enabled</CTableHeaderCell>
                                <CTableHeaderCell>Start Date</CTableHeaderCell>
                                <CTableHeaderCell>End Date</CTableHeaderCell>
                                <CTableHeaderCell>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {messages.map((message, index) => (
                                <CTableRow key={index}>
                                    <CTableDataCell>{message.id}</CTableDataCell>
                                    <CTableDataCell>{message.title}</CTableDataCell>
                                    <CTableDataCell>
                                        {message.content ? (
                                            <img src={`http://localhost:3001/uploads/${message.content}`} alt={message.title} style={{ width: '100px' }} />
                                        ) : (
                                            <span>No Content</span>
                                        )}
                                    </CTableDataCell>
                                    <CTableDataCell>{message.enable ? 'Yes' : 'No'}</CTableDataCell>
                                    <CTableDataCell>{message.start_date}</CTableDataCell>
                                    <CTableDataCell>{message.end_date}</CTableDataCell>
                                    <CTableDataCell>
                                        <CButton color="info" size="sm" onClick={() => handleEdit(message)}>
                                            <CIcon icon={cilPencil} />
                                        </CButton>{' '}
                                        <CButton color="danger" size="sm" onClick={() => handleDelete(message.id)}>
                                            <CIcon icon={cilTrash} />
                                        </CButton>
                                    </CTableDataCell>
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
                                type="file"
                                name="content"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
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
                            <CFormCheck
                                type="checkbox"
                                name="enable"
                                label="Enable"
                                checked={newMessage.enable || false}
                                onChange={handleInputChange}
                                className="mb-3"
                            />
                            <div className="mb-3">
                                <label htmlFor="rooms">Select Rooms</label>
                                <select
                                    id="rooms"
                                    name="rooms"
                                    multiple
                                    className="form-control"
                                    value={newMessage.selectedRooms}
                                    onChange={handleRoomSelection}
                                >
                                    {availableRooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.room_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
