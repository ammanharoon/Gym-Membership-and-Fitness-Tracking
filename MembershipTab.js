import React from 'react';

const MembershipTab = ({ currentPlan, membershipTier, onChangePlan }) => {
  return (
    <div>
      {/* Membership Details Card */}
      <div className="bg-gray-800 rounded-lg shadow mb-6">
        <div className={`${currentPlan.color} px-6 py-4 text-white rounded-t-lg`}>
          <h3 className="text-xl font-bold">{currentPlan.name}</h3>
          <p className="text-sm opacity-80">Active since {new Date().toLocaleDateString()}</p>
        </div>
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-200 mb-4">Membership Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h5 className="text-sm font-medium text-gray-400">Features Included:</h5>
              <ul className="mt-2 space-y-1">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-center">
                    <svg className="h-4 w-4 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-400">Billing Information:</h5>
              <div className="mt-2">
                <p className="text-sm text-gray-300">Next billing date: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={onChangePlan}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
            >
              Change Plan
            </button>
          </div>
        </div>
      </div>
      
      {/* Billing History Card */}
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-200">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {new Date().toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                  Monthly Membership - {currentPlan.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {membershipTier === 'basic' ? '$10.00' : 
                   membershipTier === 'standard' ? '$25.00' : '$50.00'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    Paid
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipTab;