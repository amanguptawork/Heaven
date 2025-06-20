import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-hot-toast';

// Create Portal component for Support Modal
const SupportModalPortal = ({ children }) => {
  const [modalRoot, setModalRoot] = useState(null);
 
  useEffect(() => {
    // Create div and add it to the end of the body
    const modalRootDiv = document.createElement('div');
    modalRootDiv.setAttribute('id', 'support-modal-root');
    document.body.appendChild(modalRootDiv);
    setModalRoot(modalRootDiv);
   
    // Clean up function to remove the div when component unmounts
    return () => {
      if (document.body.contains(modalRootDiv)) {
        document.body.removeChild(modalRootDiv);
      }
    };
  }, []);
 
  // Only render when modalRoot is available
  return modalRoot ? ReactDOM.createPortal(children, modalRoot) : null;
};

const SupportModal = ({ isOpen, onClose, userProfile }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
   
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/support/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          userName: userProfile?.name || 'Anonymous User',
          userEmail: userProfile?.email || 'No email provided'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss();
        toast.success('Your message has been sent successfully!');
        setFormData({ subject: '', message: '' });
        onClose();
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending support message:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <SupportModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <h2 className="text-white text-2xl font-semibold">Contact Support</h2>
            <p className="text-purple-100 mt-1">We're here to help you</p>
          </div>
         
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="What can we help you with?"
                required
              />
            </div>
           
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>
           
            <div className="text-xs text-gray-500">
              Your message will be sent to our support team. We'll contact you at {userProfile?.email || 'your registered email'}.
            </div>
           
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-70"
              >
                {loading ?
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span> :
                  'Send Message'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </SupportModalPortal>
  );
};

export default SupportModal;
