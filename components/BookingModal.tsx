import React, { useState } from 'react';
import { Property } from '../types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingModalProps {
  property: Property;
  onClose: () => void;
  onConfirm?: (checkIn: string, checkOut: string, guests: number) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  property,
  onClose,
  onConfirm,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkInDate, setCheckInDate] = useState<string | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<string | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [step, setStep] = useState<'dates' | 'guests' | 'review'>('dates');

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isCheckIn = dateStr === checkInDate;
      const isCheckOut = dateStr === checkOutDate;
      const isBetween =
        checkInDate &&
        checkOutDate &&
        date > new Date(checkInDate) &&
        date < new Date(checkOutDate);

      days.push(
        <button
          key={day}
          onClick={() => {
            if (!checkInDate || (checkInDate && checkOutDate)) {
              setCheckInDate(dateStr);
              setCheckOutDate(null);
            } else if (dateStr > checkInDate) {
              setCheckOutDate(dateStr);
            } else {
              setCheckInDate(dateStr);
              setCheckOutDate(null);
            }
          }}
          disabled={isPast}
          className={`aspect-square rounded-lg font-semibold text-sm transition-colors ${
            isPast
              ? 'text-gray-300 cursor-not-allowed'
              : isCheckIn || isCheckOut
              ? 'bg-gray-900 text-white'
              : isBetween
              ? 'bg-gray-200'
              : isToday
              ? 'border-2 border-gray-900'
              : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const check = new Date(checkInDate);
    const checkout = new Date(checkOutDate);
    return Math.ceil((checkout.getTime() - check.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = nights * property.pricePerNight;
  const serviceFee = Math.round(totalPrice * 0.1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Book {property.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'dates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Your Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[currentMonth, new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)].map(
                    (month, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">
                            {monthNames[month.getMonth()]} {month.getFullYear()}
                          </h4>
                          {idx === 0 && (
                            <button
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                                )
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <ChevronLeft size={20} />
                            </button>
                          )}
                          {idx === 1 && (
                            <button
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                                )
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <ChevronRight size={20} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600">
                              {day}
                            </div>
                          ))}
                          {renderCalendar(month)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {checkInDate && checkOutDate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Selected dates:</p>
                  <p className="font-semibold">
                    {new Date(checkInDate).toLocaleDateString()} -{' '}
                    {new Date(checkOutDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{nights} nights</p>
                </div>
              )}

              <button
                onClick={() => setStep('guests')}
                disabled={!checkInDate || !checkOutDate}
                className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'guests' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Number of Guests</h3>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                    className="w-12 h-12 border-2 border-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold">{numberOfGuests}</span>
                  <button
                    onClick={() =>
                      setNumberOfGuests(Math.min(property.guestCapacity, numberOfGuests + 1))
                    }
                    disabled={numberOfGuests >= property.guestCapacity}
                    className="w-12 h-12 border-2 border-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Maximum {property.guestCapacity} guests
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('dates')}
                  className="flex-1 border-2 border-gray-900 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Your Booking</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold">
                      {new Date(checkInDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold">
                      {new Date(checkOutDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold">{numberOfGuests}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    ${property.pricePerNight} × {nights} nights
                  </span>
                  <span className="font-semibold">${totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service fee</span>
                  <span className="font-semibold">${serviceFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold">${totalPrice + serviceFee}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('guests')}
                  className="flex-1 border-2 border-gray-900 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() =>
                    onConfirm?.(checkInDate!, checkOutDate!, numberOfGuests)
                  }
                  className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
