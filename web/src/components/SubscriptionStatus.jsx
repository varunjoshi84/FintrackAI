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
    <div className={`mb-6 p-4 rounded-xl border transition-all ${
      isExpired ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 
      isExpiringSoon ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200' : 
      'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isExpired ? 'bg-red-100 text-red-600' :
            isExpiringSoon ? 'bg-amber-100 text-amber-600' :
            'bg-emerald-100 text-emerald-600'
          }`}>
            <i className={`fas ${isExpired ? 'fa-exclamation-circle' : isExpiringSoon ? 'fa-clock' : 'fa-check-circle'} text-base`}></i>
          </div>
          <div>
            <h3 className={`font-bold text-sm sm:text-base ${
              isExpired ? 'text-red-900' : 
              isExpiringSoon ? 'text-amber-900' : 
              'text-emerald-900'
            }`}>
              {currentPlan} Plan
              {isExpired && ' — Expired'}
              {isExpiringSoon && ' — Expiring Soon'}
            </h3>
            <p className={`text-xs sm:text-sm mt-0.5 ${
              isExpired ? 'text-red-700' : 
              isExpiringSoon ? 'text-amber-700' : 
              'text-emerald-700'
            }`}>
              {isExpired 
                ? wasDowngraded 
                  ? `Your premium plan expired on ${new Date(planEndDate).toLocaleDateString()}. Upgrade to continue enjoying premium features.`
                  : `Expired on ${new Date(planEndDate).toLocaleDateString()}`
                : `${daysRemaining} days remaining • Expires ${new Date(planEndDate).toLocaleDateString()}`
              }
            </p>
          </div>
        </div>
        {(isExpired || isExpiringSoon) && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              if (onRenewClick) {
                onRenewClick();
              } else {
                window.location.href = '/userdashboard?tab=plan';
              }
            }} 
            className="self-start sm:self-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <i className="fas fa-crown text-xs text-amber-300"></i>
            {isExpired ? 'Upgrade Plan' : 'Renew Plan'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionStatus;