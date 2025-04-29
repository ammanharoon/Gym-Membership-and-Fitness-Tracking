import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AppAuth";

const PaymentGateway = ({ membershipDetails, onSuccess, onCancel }) => {
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { token, updateMembership } = useAuth();

  // Generate year options for expiry
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Format credit card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    }
    return value;
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format and validation based on field
    if (name === "cardNumber") {
      const formattedValue = formatCardNumber(value);
      setCardInfo({
        ...cardInfo,
        [name]: formattedValue
      });
      validateField(name, formattedValue.replace(/\s/g, ""));
    } else if (name === "cvv") {
      const numericValue = value.replace(/\D/g, "").substring(0, 4);
      setCardInfo({
        ...cardInfo,
        [name]: numericValue
      });
      validateField(name, numericValue);
    } else if (name === "expiryMonth" || name === "expiryYear") {
      setCardInfo({
        ...cardInfo,
        [name]: value
      });
      validateExpiry(cardInfo.expiryMonth, cardInfo.expiryYear, name === "expiryMonth" ? value : cardInfo.expiryMonth, name === "expiryYear" ? value : cardInfo.expiryYear);
    } else {
      setCardInfo({
        ...cardInfo,
        [name]: value
      });
      validateField(name, value);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    let fieldErrors = { ...errors };
    
    switch (name) {
      case "cardNumber":
        const cardNumberRegex = /^[0-9]{13,19}$/;
        if (!value) {
          fieldErrors.cardNumber = "Card number is required";
        } else if (!cardNumberRegex.test(value)) {
          fieldErrors.cardNumber = "Invalid card number";
        } else if (!validateLuhn(value)) {
          fieldErrors.cardNumber = "Invalid card number checksum";
        } else {
          delete fieldErrors.cardNumber;
        }
        break;
        
      case "cardholderName":
        if (!value) {
          fieldErrors.cardholderName = "Cardholder name is required";
        } else if (value.length < 3) {
          fieldErrors.cardholderName = "Name must be at least 3 characters";
        } else {
          delete fieldErrors.cardholderName;
        }
        break;
        
      case "cvv":
        const cvvRegex = /^[0-9]{3,4}$/;
        if (!value) {
          fieldErrors.cvv = "CVV is required";
        } else if (!cvvRegex.test(value)) {
          fieldErrors.cvv = "CVV must be 3 or 4 digits";
        } else {
          delete fieldErrors.cvv;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(fieldErrors);
  };

  // Special validation for expiry date
  const validateExpiry = (storedMonth, storedYear, month, year) => {
    let fieldErrors = { ...errors };
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();
    
    if (!month || !year) {
      fieldErrors.expiry = "Expiry date is required";
    } else {
      const selectedMonth = parseInt(month, 10);
      const selectedYear = parseInt(year, 10);
      
      if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)) {
        fieldErrors.expiry = "Card has expired";
      } else {
        delete fieldErrors.expiry;
      }
    }
    
    setErrors(fieldErrors);
  };

  // Luhn algorithm for credit card validation
  const validateLuhn = (number) => {
    let sum = 0;
    let shouldDouble = false;
    
    // Loop through values starting from the rightmost digit
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };

  // Validate all fields before submission
  const validateForm = () => {
    // Trigger validation for all fields
    validateField("cardNumber", cardInfo.cardNumber.replace(/\s/g, ""));
    validateField("cardholderName", cardInfo.cardholderName);
    validateExpiry(cardInfo.expiryMonth, cardInfo.expiryYear, cardInfo.expiryMonth, cardInfo.expiryYear);
    validateField("cvv", cardInfo.cvv);
    
    // Return true if no errors exist
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real app, you would securely send this to your payment processor
      // Here we'll simulate a payment processing delay
      setTimeout(async () => {
        try {
          // After "payment" succeeds, complete the membership process
          const response = await fetch("http://localhost:5000/api/membership/confirm-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              membershipTier: membershipDetails.tier,
              paymentMethod: "credit_card",
              // Don't send full card number to backend in a real app
              lastFourDigits: cardInfo.cardNumber.slice(-4)
            })
          });
          
          if (response.ok) {
            // Payment successful
            if (onSuccess) {
              onSuccess();
            } else {
              // Default success behavior
              updateMembership(membershipDetails.tier);
              navigate("/dashboard");
            }
          } else {
            // Payment processing failed on server
            const data = await response.json();
            setErrors({ form: data.message || "Payment processing failed" });
          }
        } catch (error) {
          console.error("Payment confirmation error:", error);
          setErrors({ form: "Network error during payment confirmation" });
        } finally {
          setIsProcessing(false);
        }
      }, 1500); // Simulate processing delay
      
    } catch (error) {
      console.error("Payment processing error:", error);
      setErrors({ form: "Payment processing failed" });
      setIsProcessing(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/membership-selection");
    }
  };

  // Detect card type based on number prefix
  const getCardType = (number) => {
    const cleanNumber = number.replace(/\s+/g, "");
    
    if (/^4/.test(cleanNumber)) return "Visa";
    if (/^5[1-5]/.test(cleanNumber)) return "Mastercard";
    if (/^3[47]/.test(cleanNumber)) return "American Express";
    if (/^(6011|65|64[4-9])/.test(cleanNumber)) return "Discover";
    
    return "Credit Card";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Complete Your Payment</h2>
        
        {membershipDetails && (
          <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-medium text-indigo-800">
              {membershipDetails.name || membershipDetails.tier.charAt(0).toUpperCase() + membershipDetails.tier.slice(1)} Plan
            </h3>
            <p className="text-indigo-600 text-lg font-bold">
              {membershipDetails.price || 
               (membershipDetails.tier === 'basic' ? '$10.00' : 
                membershipDetails.tier === 'standard' ? '$25.00' : '$50.00')}
            </p>
          </div>
        )}
        
        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  value={cardInfo.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.cardNumber ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                  }`}
                  maxLength="19"
                />
                {cardInfo.cardNumber && (
                  <span className="absolute right-3 top-2 text-gray-500">
                    {getCardType(cardInfo.cardNumber)}
                  </span>
                )}
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>
            
            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                name="cardholderName"
                value={cardInfo.cardholderName}
                onChange={handleChange}
                placeholder="John Smith"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.cardholderName ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                }`}
              />
              {errors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
              )}
            </div>
            
            {/* Expiry Date and CVV */}
            <div className="flex space-x-4">
              <div className="w-2/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <div className="flex space-x-2">
                  <select
                    name="expiryMonth"
                    value={cardInfo.expiryMonth}
                    onChange={handleChange}
                    className={`w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.expiry ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    name="expiryYear"
                    value={cardInfo.expiryYear}
                    onChange={handleChange}
                    className={`w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.expiry ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                    }`}
                  >
                    <option value="">Year</option>
                    {yearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.expiry && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
                )}
              </div>
              
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  name="cvv"
                  value={cardInfo.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="4"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.cvv ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200"
                  }`}
                />
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>
            
            {/* Submit and Cancel Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="w-1/3 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-2/3 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ${membershipDetails?.price || ''}`
                )}
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-6 border-t pt-4">
          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted. We do not store your full card details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateway;