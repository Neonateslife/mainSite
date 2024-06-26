import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeadWithBack from "../microcomponents/HeadWithBack";
import { Input } from "../microcomponents/textComponents";
import { Button3 } from "../microcomponents/RoundedButton";
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { setBookingDetails } from '../../redux/userSlice';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Danger, Success, Warning } from '../microcomponents/Toast';

export default function Checkout() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('bookingId');
  
  const selectedDoctor = useSelector(state => state.user.selectedDoctor);
  const bookingDetails = useSelector(state => state.user.bookingDetails);

  const [phoneNumber, setPhoneNumber] = useState('');

  // the toasts
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showWarning2, setShowWarning2] = useState(false);

  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  // Ensure bookingDetails is defined before creating the data object
  const data = bookingDetails && selectedDoctor ? {
    doctor: `${selectedDoctor.firstName} ${selectedDoctor.secondName}`,
    mode: bookingDetails.mode,
    time: bookingDetails.time,
    date: bookingDetails.day,
  } : {};

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!bookingDetails || !selectedDoctor) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 5000);
      return;
    }

    const paymentDetails = {
      total: 10, // Example total amount
      phone: phoneNumber,
      bookingId, // Include the booking ID
    };

    try {
      const response = await axios.post('https://api.mindlyfe.org/pay', paymentDetails);
      if (response.status !== 200) {
        setShowWarning(true);
        setTimeout(() => {
          setShowWarning(false);
        }, 5000);
        await deleteAppointment();
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);


      
      const generateMeetLink = () => {
        if (response.data.paymentStatus && response.data.paymentStatus === 'SUCCESSFUL') {
          window.location.href = `https://api.mindlyfe.org/?bookingId=${bookingId}`;
        } else {
          console.error('Payment was not successful:', response.data);
        }
      };

      const generateMeetId = async () => {
        if (response.data.paymentStatus && response.data.paymentStatus === 'SUCCESSFUL') {
          const meetId = uuidv4();
          const bookingRef = doc(db, 'bookings', bookingId);
          await updateDoc(bookingRef, { meetingId: meetId });
        } else {
          console.error('Payment was not successful:', response.data);
        }
      };
      if (data.mode === 'Online') {
        generateMeetLink();
      } else {
        generateMeetId();
      }

      console.log(response.data.paymentStatus);

    } catch (error) {
      await deleteAppointment();
      alert(error);
      console.error('Error making payment request:', error);
    }
  };

  const deleteAppointment = async () => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await deleteDoc(bookingRef);
      // dispatch(setBookingDetails(null));
      setShowWarning2(true);
      setTimeout(() => {
        setShowWarning2(false);
      }, 5000);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  return (
    <>
      <div className="div">
        <HeadWithBack heading='Check out appointment' />
        <div className="toast absolute top-[50px]">
          {showSuccess && <Success text='Payment was successful' />}
          {showError && <Danger text='Payment was not successful' />}
          {showWarning && <Warning text='Payment was not successful' />}
          {showWarning2 && <Danger text='Appointment has been deleted' />}
        </div>
        <div className="div w-[90%] m-auto mt-10 border-solid border-[1px] border-greytextfade rounded-lg p-5">
          <div className="summa p-2 text-center border-solid border-[1px] border-greytextfade rounded-lg">
            <h3 className='text-greytextfade p-0 m-0 text-[20px]'>Booking summary</h3>
          </div>
          {bookingDetails && selectedDoctor ? (
            <div className="div pt-3 flex justify-evenly gap-2">
              <div className="div text-center w-[50%] border-solid border-[1px] border-greytextfade rounded-lg">
                <ul className='flex flex-col gap-2 p-2'>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>Doctor</li>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>Date</li>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>Time</li>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>Mode</li>
                </ul>
              </div>
              <div className="div text-center w-[50%] border-solid border-[1px] border-greytextfade rounded-lg">
                <ul className='flex flex-col gap-2 p-2'>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>{data.doctor}</li>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>{data.date}</li>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>{data.time}</li>
                  <li className='text-greytextdark text-[15px] p-3 w-full rounded-lg transition-all duration-100 hover:scale-100 hover:bg-smoke md:text-[20px]'>{data.mode}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500">Loading booking details...</div>
          )}
        </div>
        <form className="w-[90%] m-auto mt-[20px] rounded-lg border-solid border-[1px] border-greytextfade p-3" onSubmit={handleClick}>
          <div className="summa p-2 text-center border-solid border-[1px] border-greytextfade rounded-lg">
            <h3 className='text-greytextfade p-0 m-0 text-[20px]'>Enter billing address</h3>
          </div>
          <div className="div pt-[50px]">
            <Input label='MTN Phone number' placeholder='Enter phone number (MTN)' value={phoneNumber} onChange={handlePhoneNumberChange} />
          </div>
          <div className="div mt-5 w-full">
            <Button3 text='Check out' bg='bg-blue' color='text-white' rounded='rounded-[10px]' width='w-[90%] m-auto' onClick={handleClick} />
          </div>
        </form>
      </div>
    </>
  );
}
