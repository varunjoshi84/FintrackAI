import { API_BASE_URL } from './config.js';

// Send contact form message (public)
export const sendContactMessage = async (contactData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send message');
    }

    const result = await response.json();
    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to send message'
    };
  }
};
