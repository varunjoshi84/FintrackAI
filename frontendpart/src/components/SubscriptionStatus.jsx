import { useState, useEffect } from 'react';

const SubscriptionStatus = ({ onRenewClick }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/subscription/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setSubscription(data.data);
          
          // Update localStorage userInfo if plan was downgraded
          if (data.data.wasDowngraded) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            userInfo.plan = 'Basic';
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
    
    // Re-fetch when user comes back to the page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchSubscriptionStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) return null;
  if (!subscription) return null;

  const { currentPlan, planEndDate, daysRemaining, subscriptionStatus, wasDowngraded } = subscription;

  // Don't show for basic plan unless it was just downgraded from an expired plan
  if (currentPlan === 'Basic' && !wasDowngraded) return null;

  const isExpired = subscriptionStatus === 'expired' || wasDowngraded;
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0 && !isExpired;

  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      isExpired ? 'bg-red-50 border-red-200' : 
      isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 
      'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold ${
            isExpired ? 'text-red-800' : 
            isExpiringSoon ? 'text-yellow-800' : 
            'text-green-800'
          }`}>
            {currentPlan} Plan
            {isExpired && ' - Expired'}
            {isExpiringSoon && ' - Expiring Soon'}
          </h3>
          <p className={`text-sm ${
            isExpired ? 'text-red-600' : 
            isExpiringSoon ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {isExpired 
              ? wasDowngraded 
                ? `Your premium plan expired on ${new Date(planEndDate).toLocaleDateString()}. Upgrade to continue enjoying premium features.`
                : `Expired on ${new Date(planEndDate).toLocaleDateString()}`
              : `${daysRemaining} days remaining • Expires ${new Date(planEndDate).toLocaleDateString()}`
            }
          </p>
        </div>
        {(isExpired || isExpiringSoon) && onRenewClick && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              onRenewClick();
            }} 
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            {isExpired ? 'Upgrade Now' : 'Renew Now'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;